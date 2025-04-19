from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import AllergyAddiction, Patient

allergies_bp = Blueprint('allergies_bp', __name__)

@allergies_bp.route('/', methods=['POST'])
def add_allergies_addictions():
    data = request.get_json() or {}
    pid = data.get('patient_id')
    entries = data.get('entries')  # Expect list of {type, description}

    if not pid or not entries:
        return jsonify({'error': 'patient_id and entries required'}), 400

    patient = Patient.query.get(pid)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    created = []
    for item in entries:
        typ = item.get('type')  # 'Allergy' or 'Addiction'
        desc = item.get('description')
        if typ and desc:
            obj = AllergyAddiction(patient_id=pid, type=typ, description=desc)
            db.session.add(obj)
            created.append({'type': typ, 'description': desc})
    db.session.commit()

    return jsonify({'added': created}), 201
