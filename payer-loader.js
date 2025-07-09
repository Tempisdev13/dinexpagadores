const payerId = parseInt(document.getElementById('businnes-id')?.value, 10);

if (!payerId) {
    document.getElementById('payer-info').innerHTML = '';
} else {
    fetch('../../dinex-countries-payer.json')
        .then(res => res.json())
        .then(data => {
            let foundCountry = null;
            let payer = null;

            for (const country of data) {
                payer = (country.Payers || []).find(p => p.IdPayer === payerId);
                if (payer) {
                    foundCountry = country;
                    break;
                }
            }

            if (!payer || !foundCountry) {
                document.getElementById('payer-info').innerHTML = '';
                return;
            }

            // Nombre limpio sin texto después de '('
            const cleanName = payer.PayerName.split('(')[0].trim();

            // Mostrar nombre de país
            const countryNameElem = document.getElementById('country-name');
            if (countryNameElem) {
                countryNameElem.textContent = foundCountry.CountryName;
            }

            // Mostrar sucursales
            const sucursalesSpan = document.getElementById('sucursales-text');
            if (sucursalesSpan) {
                sucursalesSpan.textContent = `Más de ${payer.Branches} sucursales`;
                sucursalesSpan.parentElement.classList.remove('d-none');
            }

            // Limite diario (MXP)
            const limiteDia = payer.Limits.find(
                l => l.TimeInDays === 0 && l.CountryCurrency === "MEXICO - MEXICAN PESO"
            );
            if (limiteDia) {
                const limiteDiaSpan = document.getElementById('limite-dia');
                if (limiteDiaSpan) {
                    limiteDiaSpan.textContent = `Hasta $${limiteDia.Amount.toLocaleString()} MXP por día`;
                    limiteDiaSpan.parentElement.classList.remove('d-none');
                }
            }

            // Limite mensual (MXP)
            const limiteMes = payer.Limits.find(
                l => l.TimeInDays === 30 && l.CountryCurrency === "MEXICO - MEXICAN PESO"
            );
            if (limiteMes) {
                const limiteMesSpan = document.getElementById('limite-mes');
                if (limiteMesSpan) {
                    limiteMesSpan.textContent = `Máximo $${limiteMes.Amount.toLocaleString()} MXP por mes`;
                    limiteMesSpan.parentElement.classList.remove('d-none');
                }
            }

            // Reemplazar texto de nombre del negocio global con nombre limpio
            document.querySelectorAll('.nombre-negocio').forEach(elem => {
                elem.textContent = cleanName;
            });

            // Mostrar u ocultar pestañas según PaymentTypes
            const paymentTypeTabMap = {
                'CASH': 'pills-home',
                'DEPOSIT': 'pills-profile',
                'ATM': 'pills-contact'
            };

            const availableGroups = payer.PaymentTypes.map(pt => pt.PaymentTypeGroup);

            for (const [group, tabId] of Object.entries(paymentTypeTabMap)) {
                const tabPane = document.getElementById(tabId);
                const navTab = document.querySelector(`[data-bs-target="#${tabId}"], [href="#${tabId}"]`);

                if (availableGroups.includes(group)) {
                    if (tabPane) tabPane.classList.remove('d-none');
                    if (navTab) navTab.classList.remove('d-none');

                    // Actualizar nombre del negocio dentro de esa tab con nombre limpio
                    tabPane?.querySelectorAll('.nombre-negocio').forEach(el => {
                        el.textContent = cleanName;
                    });
                } else {
                    if (tabPane) tabPane.classList.add('d-none');
                    if (navTab) navTab.classList.add('d-none');
                }
            }

            // Información detallada debajo del selector
            const methods = payer.PaymentTypes.map(pt => {
                const currencies = pt.Currencies.map(c => `${c.CurrencyName} (${c.CurrencyCode})`).join(', ');
                return `<li><strong>${pt.PaymentTypeGroup}</strong>: ${currencies}</li>`;
            }).join('');

            const limitsHtml = payer.Limits.map(l => `
                <li>${l.CountryCurrency}: $${l.Amount.toFixed(2)} (plazo: ${l.TimeInDays} días)</li>
            `).join('');

            const html = `
                <h3>${cleanName} (${payer.PayerCode})</h3>
                <p><strong>Sucursales:</strong> ${payer.Branches}</p>
                <p><strong>Métodos de pago y monedas aceptadas:</strong></p>
                <ul>${methods}</ul>
                <p><strong>Límites por moneda y plazo:</strong></p>
                <ul>${limitsHtml}</ul>
            `;
            document.getElementById('payer-info').innerHTML = html;
        })
        .catch(err => {
            console.error('Error cargando pagadores:', err);
            document.getElementById('payer-info').innerHTML = '';
        });
}
