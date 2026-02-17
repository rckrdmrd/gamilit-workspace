#!/usr/bin/env python3
"""
Resolver deterministico de perfil, principios, skills y contexto.

Uso:
  python orchestration/agents/tools/profile_skill_resolver.py --task "crear endpoint nestjs"
  python orchestration/agents/tools/profile_skill_resolver.py --task "crear ui react" --task-type frontend
  python orchestration/agents/tools/profile_skill_resolver.py --validate
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Set, Tuple


ROOT = Path(__file__).resolve().parents[3]
MAP_PATH = ROOT / "orchestration" / "agents" / "configs" / "PROFILE-SKILL-MAP.json"
SKILLS_REGISTRY = ROOT / "orchestration" / "inventarios" / "SKILLS-REGISTRY.yml"


@dataclass
class Resolution:
    primary_profile_id: str
    primary_alias: str
    secondary_profile_ids: List[str]
    confidence: float
    matched_keywords: List[str]
    principles: List[str]
    directives: List[str]
    skills: List[str]
    context_files: List[str]
    feature_flags: Dict[str, bool]


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return value.lower().strip()


def load_map() -> dict:
    with MAP_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def keyword_in_task(keyword: str, normalized_task: str) -> bool:
    normalized_keyword = normalize(keyword)
    if len(normalized_keyword) <= 2:
        pattern = rf"\b{re.escape(normalized_keyword)}\b"
        return re.search(pattern, normalized_task) is not None
    if " " in normalized_keyword:
        return normalized_keyword in normalized_task
    pattern = rf"\b{re.escape(normalized_keyword)}\b"
    return re.search(pattern, normalized_task) is not None


def resolve_profile(ssot: dict, task: str, task_type: str | None) -> Tuple[str, List[str], List[str], float]:
    normalized_task = normalize(task)
    profiles = ssot["profiles"]
    scores: Dict[str, int] = {profile_id: 0 for profile_id in profiles}
    matched_keywords: List[str] = []

    if task_type:
        for rank, profile_id in enumerate(ssot["task_type_to_profile_priority"].get(task_type, [])):
            scores[profile_id] = scores.get(profile_id, 0) + max(8 - rank, 1)

    for profile_id, profile_data in profiles.items():
        for keyword in profile_data.get("keywords", []):
            if keyword_in_task(keyword, normalized_task):
                scores[profile_id] += 3
                matched_keywords.append(keyword)

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_profile_id, top_score = ranked[0]

    if top_score <= 0:
        top_profile_id = ssot["fallback_profile_id"]
        top_score = 1

    secondary_profile_ids: List[str] = []
    if len(ranked) > 1:
        second_profile_id, second_score = ranked[1]
        if second_score >= max(3, top_score - 2) and second_profile_id != top_profile_id:
            secondary_profile_ids.append(second_profile_id)

    confidence = min(0.99, round(top_score / max(top_score + 4, 1), 2))
    return top_profile_id, secondary_profile_ids, sorted(set(matched_keywords)), confidence


def build_result(ssot: dict, profile_id: str, secondary_ids: List[str], matched: List[str], confidence: float, enable_vercel_deploy: bool) -> Resolution:
    profile = ssot["profiles"][profile_id]

    principles = list(dict.fromkeys(ssot.get("principles_base", []) + profile.get("principles_extra", [])))
    directives = list(dict.fromkeys(profile.get("directives", [])))
    skills = list(profile.get("skills", []))

    flags = ssot.get("feature_flags", {})
    vercel_dev_enabled = bool(flags.get("enable_vercel_dev_skills", False))
    vercel_deploy_enabled = bool(flags.get("enable_vercel_deploy_skill", False) or enable_vercel_deploy)

    if not vercel_dev_enabled and "vercel-v0-dev" in skills:
        skills.remove("vercel-v0-dev")

    if not vercel_deploy_enabled and "vercel-next-deploy" in skills:
        skills.remove("vercel-next-deploy")

    context_files: List[str] = []
    for pack_id in profile.get("context_pack_ids", []):
        context_files.extend(ssot.get("context_packs", {}).get(pack_id, []))
    context_files = list(dict.fromkeys(context_files))

    return Resolution(
        primary_profile_id=profile_id,
        primary_alias=profile["alias"],
        secondary_profile_ids=secondary_ids,
        confidence=confidence,
        matched_keywords=matched,
        principles=principles,
        directives=directives,
        skills=skills,
        context_files=context_files,
        feature_flags={
            "vercel_dev": vercel_dev_enabled,
            "vercel_deploy": vercel_deploy_enabled,
        },
    )


def validate_paths(ssot: dict) -> Tuple[bool, List[str]]:
    errors: List[str] = []

    def check_path(path_value: str, context: str) -> None:
        if not (ROOT / path_value).exists():
            errors.append(f"[MISSING] {context}: {path_value}")

    for principle in ssot.get("principles_base", []):
        check_path(principle, "principles_base")

    for pack_id, files in ssot.get("context_packs", {}).items():
        for path in files:
            check_path(path, f"context_packs.{pack_id}")

    for profile_id, profile in ssot.get("profiles", {}).items():
        check_path(profile["profile_file"], f"profiles.{profile_id}.profile_file")
        for directive in profile.get("directives", []):
            check_path(directive, f"profiles.{profile_id}.directives")
        for skill in profile.get("skills", []):
            catalog = ssot.get("skills_catalog", {}).get(skill)
            if not catalog:
                errors.append(f"[MISSING] skills_catalog entry for skill: {skill}")
                continue
            check_path(catalog["path"], f"skills_catalog.{skill}.path")

    skills_catalog = ssot.get("skills_catalog", {})
    for skill_name, catalog in skills_catalog.items():
        if "contract_version" not in catalog:
            errors.append(f"[MISSING] skills_catalog.{skill_name}.contract_version")
        for dep_skill in catalog.get("dependencies", []):
            if dep_skill not in skills_catalog:
                errors.append(
                    f"[MISSING] skills_catalog.{skill_name}.dependencies -> {dep_skill} no existe en skills_catalog"
                )

    for profile_id, profile in ssot.get("profiles", {}).items():
        profile_skills: Set[str] = set(profile.get("skills", []))
        for skill_name in profile_skills:
            catalog = skills_catalog.get(skill_name)
            if not catalog:
                continue
            for dep_skill in catalog.get("dependencies", []):
                if dep_skill not in profile_skills:
                    errors.append(
                        f"[MISSING] profiles.{profile_id}.skills debe incluir dependencia {dep_skill} para {skill_name}"
                    )

    if not SKILLS_REGISTRY.exists():
        errors.append("[MISSING] orchestration/inventarios/SKILLS-REGISTRY.yml")
    else:
        registry_skills = parse_registry_skill_names(SKILLS_REGISTRY)
        for skill_name in skills_catalog.keys():
            if skill_name not in registry_skills:
                errors.append(f"[MISSING] SKILLS-REGISTRY.yml no contiene skill: {skill_name}")

    return len(errors) == 0, errors


def parse_registry_skill_names(registry_path: Path) -> Set[str]:
    """
    Parser ligero para SKILLS-REGISTRY.yml sin dependencias externas.
    Busca líneas con formato: "- name: <skill-name>".
    """
    names: Set[str] = set()
    with registry_path.open("r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            match = re.match(r"^- name:\s*([A-Za-z0-9._-]+)\s*$", line)
            if match:
                names.add(match.group(1))
    return names


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolver de perfil/skills SIMCO.")
    parser.add_argument("--task", type=str, help="Descripcion de tarea.")
    parser.add_argument("--task-type", type=str, choices=["backend", "frontend", "database", "devops", "docs", "multi"], help="Tipo de tarea.")
    parser.add_argument("--enable-vercel-deploy", action="store_true", help="Habilita skill de deploy Vercel para esta ejecucion.")
    parser.add_argument("--validate", action="store_true", help="Valida rutas referenciadas en el SSOT.")
    args = parser.parse_args()

    ssot = load_map()

    if args.validate:
        ok, errors = validate_paths(ssot)
        report = {"ok": ok, "errors": errors, "checked_file": str(MAP_PATH.relative_to(ROOT))}
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return 0 if ok else 1

    if not args.task:
        parser.error("--task es obligatorio cuando no se usa --validate")

    env_enable_vercel = normalize(os.getenv("SIMCO_ENABLE_VERCEL_DEPLOY", "0")) in {"1", "true", "yes"}
    resolved_profile, secondary_ids, matched_keywords, confidence = resolve_profile(ssot, args.task, args.task_type)
    result = build_result(
        ssot,
        resolved_profile,
        secondary_ids,
        matched_keywords,
        confidence,
        enable_vercel_deploy=bool(args.enable_vercel_deploy or env_enable_vercel),
    )

    print(
        json.dumps(
            {
                "primary_profile_id": result.primary_profile_id,
                "primary_alias": result.primary_alias,
                "secondary_profile_ids": result.secondary_profile_ids,
                "confidence": result.confidence,
                "matched_keywords": result.matched_keywords,
                "principles": result.principles,
                "directives": result.directives,
                "skills": result.skills,
                "context_files": result.context_files,
                "feature_flags": result.feature_flags,
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
