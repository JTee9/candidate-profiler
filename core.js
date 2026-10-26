/* Tal Solutions personal tools - shared core.
   No API calls. Builds a prompt from the form inputs to copy & paste into any LLM. */
const TalTool = (() => {
  const $ = (s) => document.querySelector(s);
  const lsGet = (k, d = '') => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

  function init(cfg) {
    const P = cfg.id + '_';
    function showError(msg) { const e = $('#errorBox'); e.textContent = msg; e.style.display = 'block'; }

    async function run() {
      $('#errorBox').style.display = 'none';
      const input = await cfg.collect();
      if (input.error) { showError(input.error); return; }
      const today = new Date().toISOString().slice(0, 10);
      const prompt = `${cfg.system(cfg.profile, input.lang, today)}\n\n=====\nINPUT\n=====\n${input.userText}\n\nProduce the full output now.`;
      $('#output').value = prompt;
      $('#resultWrap').style.display = 'block';
      $('#charCount').textContent = `${prompt.length.toLocaleString()} characters`;
      lsSet(P + 'last', prompt);
      $('#resultWrap').scrollIntoView({ behavior: 'smooth' });
    }

    $('#runBtn').addEventListener('click', run);
    $('#copyBtn').addEventListener('click', async () => {
      const text = $('#output').value;
      try { await navigator.clipboard.writeText(text); }
      catch { $('#output').select(); document.execCommand('copy'); }
      $('#copyBtn').textContent = 'Copied ✓';
      setTimeout(() => ($('#copyBtn').textContent = 'Copy prompt'), 1500);
    });
    $('#dlBtn').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([$('#output').value], { type: 'text/plain' }));
      a.download = (cfg.filename ? cfg.filename() : 'prompt') + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#clearBtn').addEventListener('click', () => { $('#resultWrap').style.display = 'none'; $('#output').value = ''; lsSet(P + 'last', ''); });

    const prev = lsGet(P + 'last');
    if (prev) { $('#output').value = prev; $('#charCount').textContent = `${prev.length.toLocaleString()} characters`; $('#resultWrap').style.display = 'block'; }
  }
  return { init };
})();
