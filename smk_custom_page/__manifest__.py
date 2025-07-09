{
    'name': 'SMK Vue',
    'version': '18.0.1.0.0',
    'author': 'SMK Group',
    'depends': [
        'base',
        'hr',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/compass_view.xml',
        'views/main_menu.xml'
    ],
    'assets': {
        'web.assets_backend': [
            # 'my_module/static/dist/js/app.js',
            'smk_custom_page/static/src/css/app.css',
            'smk_custom_page/static/src/js/vue_admin_page.js',
            'smk_custom_page/static/src/xml/vue_template.xml',
            'smk_custom_page/static/src/xml/main_vue_template.xml',
        ],
    },
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': True,
}
