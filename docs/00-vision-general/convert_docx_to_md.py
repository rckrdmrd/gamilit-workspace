#!/usr/bin/env python3
"""
Script para convertir el documento DOCX de GAMILIT a Markdown
con descripciones detalladas de las imágenes
"""

import xml.etree.ElementTree as ET
import os
import re
from pathlib import Path

# Define namespaces
NAMESPACES = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'v': 'urn:schemas-microsoft-com:vml',
    'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes'
}

class DocxToMarkdown:
    def __init__(self, docx_dir):
        self.docx_dir = Path(docx_dir)
        self.document_path = self.docx_dir / 'word' / 'document.xml'
        self.rels_path = self.docx_dir / 'word' / '_rels' / 'document.xml.rels'
        self.markdown_content = []
        self.image_map = {}
        self.current_list_level = 0
        self.in_table = False

        # Load relationships (for image mappings)
        self._load_relationships()

    def _load_relationships(self):
        """Load image relationships"""
        if self.rels_path.exists():
            tree = ET.parse(self.rels_path)
            root = tree.getroot()

            for rel in root.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
                rel_id = rel.get('Id')
                target = rel.get('Target')
                rel_type = rel.get('Type')

                if 'image' in rel_type:
                    self.image_map[rel_id] = target

    def _get_text_from_element(self, elem):
        """Extract text from an element"""
        texts = elem.findall('.//w:t', NAMESPACES)
        return ''.join([t.text or '' for t in texts])

    def _is_bold(self, run):
        """Check if text run is bold"""
        bold = run.find('.//w:b', NAMESPACES)
        return bold is not None

    def _is_italic(self, run):
        """Check if text run is italic"""
        italic = run.find('.//w:i', NAMESPACES)
        return italic is not None

    def _get_formatted_text(self, para):
        """Get text with formatting (bold, italic)"""
        runs = para.findall('.//w:r', NAMESPACES)
        formatted_parts = []

        for run in runs:
            text = self._get_text_from_element(run)
            if not text:
                continue

            is_bold = self._is_bold(run)
            is_italic = self._is_italic(run)

            if is_bold and is_italic:
                text = f"***{text}***"
            elif is_bold:
                text = f"**{text}**"
            elif is_italic:
                text = f"*{text}*"

            formatted_parts.append(text)

        return ''.join(formatted_parts)

    def _process_image(self, drawing, context=""):
        """Process an image and return markdown with description"""
        # Get image reference
        blip = drawing.find('.//a:blip', NAMESPACES)
        if blip is None:
            return ""

        img_id = blip.get('{%s}embed' % NAMESPACES['r'])
        if not img_id or img_id not in self.image_map:
            return ""

        img_path = self.image_map[img_id]
        img_filename = os.path.basename(img_path)

        # Create a placeholder for image description
        # We'll need to manually describe these or use vision API
        description = f"[Descripción de {img_filename}]"

        return f"\n\n![{description}](word/media/{img_filename})\n"

    def _process_paragraph(self, para):
        """Process a paragraph element"""
        # Check if it's a heading
        pStyle = para.find('.//w:pStyle', NAMESPACES)
        style = pStyle.get('{%s}val' % NAMESPACES['w']) if pStyle is not None else None

        # Get formatted text content
        text = self._get_formatted_text(para)

        # Check for numbering (lists)
        numPr = para.find('.//w:numPr', NAMESPACES)
        is_list_item = numPr is not None

        # Check for images
        drawings = para.findall('.//w:drawing', NAMESPACES)
        image_md = ""
        for drawing in drawings:
            image_md += self._process_image(drawing, text)

        # Format based on style
        result = ""
        if style:
            if 'Heading1' in style or style == 'Title':
                result = '# ' + text
            elif 'Heading2' in style:
                result = '## ' + text
            elif 'Heading3' in style:
                result = '### ' + text
            elif 'Heading4' in style:
                result = '#### ' + text
            elif 'Heading5' in style:
                result = '##### ' + text
            elif 'Heading6' in style:
                result = '###### ' + text
            else:
                result = text
        elif is_list_item:
            # Get list level
            ilvl = numPr.find('.//w:ilvl', NAMESPACES)
            level = int(ilvl.get('{%s}val' % NAMESPACES['w'])) if ilvl is not None else 0
            indent = '  ' * level
            result = f"{indent}- {text}"
        else:
            result = text

        if image_md:
            result += image_md

        return result

    def _process_table(self, table):
        """Process a table element"""
        rows = table.findall('.//w:tr', NAMESPACES)
        if not rows:
            return ""

        md_table = []

        for i, row in enumerate(rows):
            cells = row.findall('.//w:tc', NAMESPACES)
            cell_texts = []

            for cell in cells:
                # Get all paragraphs in cell
                paras = cell.findall('.//w:p', NAMESPACES)
                cell_content = ' '.join([self._get_formatted_text(p).strip() for p in paras])
                cell_content = cell_content.replace('\n', ' ').replace('|', '\\|')
                cell_texts.append(cell_content)

            md_table.append('| ' + ' | '.join(cell_texts) + ' |')

            # Add separator after first row (header)
            if i == 0:
                md_table.append('| ' + ' | '.join(['---'] * len(cell_texts)) + ' |')

        return '\n' + '\n'.join(md_table) + '\n'

    def convert(self):
        """Convert the document to Markdown"""
        tree = ET.parse(self.document_path)
        root = tree.getroot()

        # Process body
        body = root.find('.//w:body', NAMESPACES)
        if body is None:
            return ""

        for elem in body:
            if elem.tag == '{%s}p' % NAMESPACES['w']:
                para_text = self._process_paragraph(elem)
                if para_text and para_text.strip():
                    self.markdown_content.append(para_text)
            elif elem.tag == '{%s}tbl' % NAMESPACES['w']:
                table_md = self._process_table(elem)
                if table_md:
                    self.markdown_content.append(table_md)

        return '\n\n'.join(self.markdown_content)

    def save(self, output_path):
        """Save markdown to file"""
        content = self.convert()
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Markdown saved to: {output_path}")
        print(f"✓ Total sections: {len(self.markdown_content)}")
        print(f"✓ Total images referenced: {len(self.image_map)}")

if __name__ == '__main__':
    converter = DocxToMarkdown('docx_extracted')
    converter.save('DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.md')
