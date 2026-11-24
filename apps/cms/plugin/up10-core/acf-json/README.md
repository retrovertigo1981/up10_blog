# SCF JSON

Aquí se exportan los grupos de campos de Secure Custom Fields para versionarlos.

Los grupos iniciales también están declarados en `includes/fields.php` para que el plugin
funcione sin depender de una exportación manual. Cuando un grupo se edite desde el admin,
exportarlo con:

```bash
wp scf json export
```

o el comando compatible:

```bash
wp acf json export
```
