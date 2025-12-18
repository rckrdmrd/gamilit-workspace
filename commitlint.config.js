module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Cambios en documentación
        'style',    // Cambios de formato (sin afectar código)
        'refactor', // Refactorización de código
        'perf',     // Mejoras de performance
        'test',     // Añadir o actualizar tests
        'build',    // Cambios en build system o dependencias
        'ci',       // Cambios en CI/CD
        'chore',    // Tareas de mantenimiento
        'revert'    // Revertir cambios
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  }
};
