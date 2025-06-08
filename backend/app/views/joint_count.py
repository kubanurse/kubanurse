from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import JointAssessment, Patient

joint_bp = Blueprint('joint_bp', __name__)

@joint_bp.route('/', methods=['POST'])
def record_joint_counts():
    data = request.get_json() or {}
    pid = data.get('patient_id')
    counts = data.get('counts')
    # Expect: list of {joint_name, is_swollen, is_tender}

    if not pid or not counts:
        return jsonify({'error': 'patient_id and counts required'}), 400

    patient = Patient.query.get(pid)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    saved = []
    for item in counts:
        name = item.get('joint_name')
        swollen = bool(item.get('is_swollen'))
        tender = bool(item.get('is_tender'))
        ja = JointAssessment(
            patient_id=pid,
            joint_name=name,
            is_swollen=swollen,
            is_tender=tender
        )
        db.session.add(ja)
        saved.append({'joint_name': name, 'is_swollen': swollen, 'is_tender': tender})
    db.session.commit()
    
    return jsonify({
        'message': 'Joint counts recorded successfully',
        'data': saved
    }), 201

