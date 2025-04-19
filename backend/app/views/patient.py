from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Patient

patient_bp = Blueprint('patient_bp', __name__)

@patient_bp.route('/', methods=['POST'])
def create_patient():
    data = request.get_json() or {}
    # Required fields
    first = data.get('first_name')
    last = data.get('last_name')
    dob = data.get('dob')  # Expect YYYY-MM-DD
    gender = data.get('gender')

    if not all([first, last, dob, gender]):
        return jsonify({'error': 'Missing required patient fields'}), 400

    patient = Patient(
        first_name=first,
        last_name=last,
        dob=dob,
        gender=gender
    )
    db.session.add(patient)
    db.session.commit()

    return jsonify({'id': patient.id}), 201
