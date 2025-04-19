from .extensions import db

class Patient(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    first_name  = db.Column(db.String(100), nullable=False)
    last_name   = db.Column(db.String(100), nullable=False)
    dob         = db.Column(db.Date, nullable=False)
    gender      = db.Column(db.String(10))
    # ... other fields

class AllergyAddiction(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    patient_id  = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    type        = db.Column(db.String(50))  # 'Allergy' or 'Addiction'
    description = db.Column(db.String(200))

class Examination(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    patient_id  = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    notes       = db.Column(db.Text)  # dictation transcript

class JointAssessment(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    patient_id  = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    joint_name  = db.Column(db.String(50))
    is_swollen  = db.Column(db.Boolean, default=False)
    is_tender   = db.Column(db.Boolean, default=False)

class Das28Result(db.Model):
    id                    = db.Column(db.Integer, primary_key=True)
    patient_id            = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    tender_count          = db.Column(db.Integer)
    swollen_count         = db.Column(db.Integer)
    esr_value             = db.Column(db.Float)
    global_assessment     = db.Column(db.Float)
    score                 = db.Column(db.Float)
