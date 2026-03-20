

function validarFormulario(event) {
    event.preventDefault();
    
    const inputsRequeridos = document.querySelectorAll('input[required]');
    let formularioValido = true;
    
    inputsRequeridos.forEach(input => {
        if (!input.value.trim()) {
            input.style.border = '2px solid red';
            input.style.backgroundColor = '#ffe6e6';
            formularioValido = false;
        } else {
            input.style.border = '';
            input.style.backgroundColor = '';
        }
    });
    
    const passElement = document.getElementById('idPassword');
    const confirmPassElement = document.getElementById('idConfirmPassword');

    if (passElement && confirmPassElement) {
        if (passElement.value !== confirmPassElement.value) {
            alert("Las contraseñas no coinciden");
            formularioValido = false;
        }
    }
    
    if (formularioValido) {
        console.log('Formulario válido - Redirigiendo...');
        window.location.href = 'videogame.html';
    } else {
        console.log('Completa todos los campos requeridos');
    }
}
