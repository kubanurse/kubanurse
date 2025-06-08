from flask import Flask
from .extensions import db, migrate, cors

def create_app(config_object='app.config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # Simple test route
    @app.route('/api/test')
    def test():
        return {'message': 'API is working!', 'status': 'ok'}

    # register blueprints
    from .views.patient     import patient_bp
    from .views.allergies   import allergies_bp
    from .views.examination import exam_bp
    from .views.joint_count import joint_bp
    from .views.das28       import das28_bp
    from .views.report      import report_bp

    app.register_blueprint(patient_bp,     url_prefix='/api/patients')
    app.register_blueprint(allergies_bp,   url_prefix='/api/allergies')
    app.register_blueprint(exam_bp,        url_prefix='/api/examination')
    app.register_blueprint(joint_bp,       url_prefix='/api/joint-count')
    app.register_blueprint(das28_bp,       url_prefix='/api/das28')

    app.register_blueprint(report_bp,      url_prefix='/api/report')
    return app
