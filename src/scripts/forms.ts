function applyPhoneMask(input: HTMLInputElement) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 7) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    input.value = v;
  });
}

export function initForms() {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-form-id]');
  forms.forEach((form) => {
    if ((form as any).__formsInitialized) return;
    (form as any).__formsInitialized = true;

    let started = false;
    let isSubmitting = false;
    const formId  = form.dataset.formId!;
    const project = form.dataset.project || window.location.hostname;

    form.querySelectorAll<HTMLInputElement>('[name="telefone"]').forEach(applyPhoneMask);

    const submitUrl   = form.dataset.submitUrl;
    const redirectUrl = form.dataset.redirect;
    const gridId      = form.dataset.gridId;
    const successId   = form.dataset.successId;

    if (!submitUrl) {
      console.warn(`[Forms] Formulário ${formId} sem URL de webhook (data-submit-url).`);
      return;
    }

    form.addEventListener('focusin', () => {
      if (!started) {
        started = true;
        (window as any).dataLayer?.push({ event: 'form_start', form_id: formId, project });
      }
    });

    const handleSubmit = async () => {
      if (isSubmitting) return;

      const hp = form.querySelector<HTMLInputElement>('[name="website"]');
      if (hp && hp.value) return;

      // Validação de campos obrigatórios
      let firstInvalid: HTMLElement | null = null;
      let isValid = true;

      form.querySelectorAll<HTMLElement>('[required]').forEach((field) => {
        const isEmpty =
          !(field as HTMLInputElement).value ||
          (field.tagName === 'SELECT' && (field as HTMLSelectElement).value === '');

        if (isEmpty) {
          isValid = false;
          (field as HTMLElement).style.borderColor = '#ef4444';
          (field as HTMLElement).style.outline = '2px solid #ef4444';
          if (!firstInvalid) firstInvalid = field;
          const clearError = () => {
            (field as HTMLElement).style.removeProperty('border-color');
            (field as HTMLElement).style.removeProperty('outline');
            field.removeEventListener('input', clearError);
            field.removeEventListener('change', clearError);
          };
          field.addEventListener('input', clearError);
          field.addEventListener('change', clearError);
        }
      });

      // Validação de formato: email
      form.querySelectorAll<HTMLInputElement>('input[type="email"]').forEach((field) => {
        if (!field.value) return; // campo vazio já capturado pelo required acima
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value);
        if (!ok) {
          isValid = false;
          (field as HTMLElement).style.borderColor = '#ef4444';
          (field as HTMLElement).style.outline = '2px solid #ef4444';
          if (!firstInvalid) firstInvalid = field;
          const clear = () => {
            (field as HTMLElement).style.removeProperty('border-color');
            (field as HTMLElement).style.removeProperty('outline');
            field.removeEventListener('input', clear);
          };
          field.addEventListener('input', clear);
        }
      });

      // Validação de formato: telefone (mínimo 10 dígitos — DDD + número)
      form.querySelectorAll<HTMLInputElement>('[name="telefone"]').forEach((field) => {
        if (!field.value) return;
        const digits = field.value.replace(/\D/g, '');
        if (digits.length < 10) {
          isValid = false;
          (field as HTMLElement).style.borderColor = '#ef4444';
          (field as HTMLElement).style.outline = '2px solid #ef4444';
          if (!firstInvalid) firstInvalid = field;
          const clear = () => {
            (field as HTMLElement).style.removeProperty('border-color');
            (field as HTMLElement).style.removeProperty('outline');
            field.removeEventListener('input', clear);
          };
          field.addEventListener('input', clear);
        }
      });

      if (!isValid) {
        firstInvalid!.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus();
        return;
      }

      const submitBtn  = form.querySelector<HTMLButtonElement>('.form-submit');
      const btnText    = submitBtn?.querySelector<HTMLElement>('.btn-text');
      const btnLoading = submitBtn?.querySelector<HTMLElement>('.btn-loading');

      const msgEl = gridId
        ? document.getElementById(gridId)?.querySelector('[id$="FormMsg"]') as HTMLElement | null
        : form.querySelector('.form-error') as HTMLElement | null;

      isSubmitting = true;
      if (submitBtn) submitBtn.disabled = true;

      if (btnText && btnLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
      } else if (submitBtn && !submitBtn.querySelector('.btn-loading')) {
        const originalText = submitBtn.innerHTML;
        submitBtn.dataset.originalText = originalText;
        submitBtn.innerHTML = 'Enviando...';
      }

      if (msgEl) msgEl.style.display = 'none';

      const formData = new FormData(form);
      const rawData: Record<string, string> = {};
      formData.forEach((v, k) => { if (k !== 'website') rawData[k] = v.toString(); });

      const trackingRaw = sessionStorage.getItem('dmove_tracking');
      const tracking: Record<string, string> = trackingRaw ? JSON.parse(trackingRaw) : {};

      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Extração e divisão de nome/sobrenome
      const fullName = (rawData['nome'] || rawData['Nome'] || '').trim();
      let firstName = fullName;
      let lastName = rawData['sobrenome'] || rawData['Sobrenome'] || '';
      if (!lastName && fullName.includes(' ')) {
        const parts = fullName.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }

      const tipoEvento = rawData['tipo'] || rawData['tipo_evento'] || rawData['Tipo'] || rawData['Tipo de evento'] || '';
      const dataEvento = rawData['data'] || rawData['data_evento'] || rawData['data_prevista'] || rawData['Data do evento'] || '';
      const convidados = rawData['pessoas'] || rawData['convidados'] || rawData['Pessoas'] || rawData['Convidados'] || '';
      const whatsapp = rawData['telefone'] || rawData['whatsapp'] || rawData['WhatsApp'] || '';
      const email = rawData['email'] || rawData['E-mail'] || '';

      const cleanPath = window.location.pathname.replace(/^\/|\/$/g, '').replace(/\.html$/, '') || 'casamentos';
      const fonteBase = rawData['fonte'] || `Landing page/${cleanPath}`;

      const trackingParamKeys = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
        'utm_content', 'utm_id', 'gclid', 'gbraid', 'wbraid',
        'fbclid', 'ttclid', 'msclkid', 'sck',
        'fbc', 'fbp', 'external_id', 'event_id',
      ];
      const qs = new URLSearchParams();
      trackingParamKeys.forEach(k => { if (tracking[k]) qs.set(k, tracking[k]); });
      const fonte = qs.toString() ? `${fonteBase}?${qs.toString()}` : fonteBase;

      // Campos Meta CAPI
      const metaCapi: Record<string, string> = {};
      if (tracking['fbc'])         metaCapi['fbc']         = tracking['fbc'];
      if (tracking['fbp'])         metaCapi['fbp']         = tracking['fbp'];
      if (tracking['external_id']) metaCapi['external_id'] = tracking['external_id'];
      if (tracking['event_id'])    metaCapi['event_id']    = tracking['event_id'];

      const payload: Record<string, string> = {
        'Sem rótulo field_bd1ca98': '',
        'Tipo de evento': tipoEvento,
        'Data do evento': dataEvento,
        'Convidados': convidados,
        'Sem rótulo field_58c27e9': '',
        'Nome': firstName,
        'Sobrenome': lastName,
        'WhatsApp': whatsapp,
        'E-mail': email,
        'Fonte': fonte,
        'Data': dateStr,
        'Horário': timeStr,
        'URL da página': window.location.href,
        'Agente de usuário': navigator.userAgent,
        'IP remoto': '',
        'Desenvolvido por': 'Dmove',
        'form_id': formId,
        'form_name': formId,
        ...metaCapi,
      };

      if (rawData['empresa']) payload['Empresa'] = rawData['empresa'];
      if (rawData['detalhes']) payload['Detalhes adicionais'] = rawData['detalhes'];

      try {
        const res = await fetch(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('http_' + res.status);

        let json: any = {};
        try { json = await res.json(); } catch {}

        (window as any).dataLayer?.push({ event: 'form_submit', form_id: formId, project });

        const redir = redirectUrl || json.redirect;
        if (redir) {
          window.location.href = redir;
          return;
        }

        const gridEl    = gridId    ? document.getElementById(gridId)    : null;
        const successEl = successId ? document.getElementById(successId) : null;

        if (gridEl && successEl) {
          gridEl.style.display = 'none';
          successEl.classList.add('active');
        } else {
          form.innerHTML = `
            <div style="text-align:center;padding:2rem;">
              <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;background:var(--color-primary,#2563eb);border-radius:50%;color:white;">✓</div>
              <h3 style="font-size:1.15rem;font-weight:600;margin-bottom:4px;">Enviado com sucesso!</h3>
              <p style="color:#666;font-size:0.9rem;">Em breve entraremos em contato.</p>
            </div>`;
        }
      } catch (err: any) {
        isSubmitting = false;
        (window as any).dataLayer?.push({ event: 'form_error', form_id: formId, error: err.message });

        if (msgEl) {
          msgEl.innerHTML = 'Erro ao enviar. Tente novamente mais tarde.';
          msgEl.style.display = 'block';
        } else {
          alert('Erro ao enviar o formulário. Tente novamente mais tarde.');
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          if (btnText && btnLoading) {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
          } else if (submitBtn.dataset.originalText) {
            submitBtn.innerHTML = submitBtn.dataset.originalText;
          }
        }
      }
    };

    const submitTrigger = form.querySelector<HTMLButtonElement>('.form-submit');
    submitTrigger?.addEventListener('click', () => { handleSubmit(); });

    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
      e.preventDefault();
      handleSubmit();
    });
  });
}
