from flask import Blueprint, request, jsonify
from datetime import datetime
from ..extensions import db
from ..models import Patient

patient_bp = Blueprint('patient_bp', __name__)

@patient_bp.route('/', methods=['GET'])
def search_patients():
    search = request.args.get('search', '')
    if search:
        # Search by first name or last name
        patients = Patient.query.filter(
            db.or_(
                Patient.first_name.ilike(f'%{search}%'),
                Patient.last_name.ilike(f'%{search}%')
            )
        ).all()
    else:
        # Return all patients if no search term
        patients = Patient.query.all()
    
    return jsonify([{
        'id': p.id,
        'first_name': p.first_name,
        'last_name': p.last_name,
        'dob': p.dob.isoformat() if p.dob else None,
        'gender': p.gender
    } for p in patients])

@patient_bp.route('/', methods=['POST'])
def create_patient():
    data = request.get_json() or {}
    # Required fields
    first = data.get('first_name')
    last = data.get('last_name')
    dob_str = data.get('dob')  # Expect YYYY-MM-DD
    gender = data.get('gender')

    if not all([first, last, dob_str, gender]):
        return jsonify({'error': 'Missing required patient fields'}), 400

    # Convert date string to date object
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD'}), 400

    patient = Patient(
        first_name=first,
        last_name=last,
        dob=dob,
        gender=gender
    )
    db.session.add(patient)
    db.session.commit()

    return jsonify({'id': patient.id}), 201
