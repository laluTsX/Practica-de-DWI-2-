import { getPatientById } from './patients.js';

let currentEditCallback = null;

export function renderPatientHistory(patientId, containerElement, onEditCallback) {
    const patient = getPatientById(patientId);
    if (!patient) {
        containerElement.innerHTML = '<p class="placeholder">Paciente no encontrado</p>';
        return;
    }
    
    const consultations = patient.consultations || [];
    if (consultations.length === 0) {
        containerElement.innerHTML = '<p class="placeholder">📋 Sin consultas aún. ¡Cree la primera!</p>';
        return;
    }
    
    let html = '';
    consultations.forEach(c => {
        html += `
            <div class="history-item" data-consultation-id="${c.id}">
                <div class="history-date">📅 ${c.date}</div>
                <div><strong> Evolución:</strong> ${c.evolution}</div>
                <div><strong> Plan alimenticio:</strong> ${c.dietPlan}</div>
                <button class="edit-btn" data-id="${c.id}">✏️ Editar Consulta</button>
            </div>
        `;
    });
    containerElement.innerHTML = html;
    
    // Agregar event listeners a los botones de editar
    const editButtons = containerElement.querySelectorAll('.edit-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const consultationId = parseInt(btn.getAttribute('data-id'));
            const consultation = consultations.find(c => c.id === consultationId);
            if (consultation && onEditCallback) {
                onEditCallback(patientId, consultation);
            }
        });
    });
}