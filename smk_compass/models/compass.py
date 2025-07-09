from odoo import models, fields


class Compass(models.Model):
    _name = 'smk.compass'
    _description = 'SMK Compass data'

    shop_id = fields.Many2one(string='Магазин',
                              comodel_name='hr.department',
                              required=True
                              )

    plan = fields.Integer(string='План')
    fact = fields.Integer(string='Факт')

    week_number = fields.Integer(string='Номер неділі')
    week_start = fields.Datetime(string='Початкова дата')
    week_end = fields.Datetime(string='Кінцева дата')

    def prepare_data(self, params):
        data_ids = self.search([('create_uid', '=', self.env.uid)])
        if not data_ids:
            return {'data': []}

        week_map = {}

        for rec in data_ids:
            shop = rec.shop_id
            region = shop.region_id

            if not rec.week_number:
                continue

            if rec.week_number not in week_map:
                week_map[rec.week_number] = {
                    "weekInfo": {
                        "number": rec.week_number,
                        "startDate": rec.week_start.isoformat(),
                        "endDate": rec.week_end.isoformat()
                    },
                    "regions": {}
                }

            if not region:
                continue  # если нет региона — пропускаем

            if region.id not in week_map[rec.week_number]["regions"]:
                week_map[rec.week_number]["regions"][region.id] = {
                    "id": region.id,
                    "name": region.name,
                    "shops": []
                }

            week_map[rec.week_number]["regions"][region.id]["shops"].append({
                "shop": {
                    "id": shop.id,
                    "name": shop.name
                },
                "sales": {
                    "plan": rec.plan,
                    "fact": rec.fact
                }
            })

        return {'data': list(week_map.values())}
