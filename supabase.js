// ═══════════════════════════════════════════════
// SUPABASE — Configuração central
// Colégio Propósito · Sistema Comercial 2027
// ═══════════════════════════════════════════════
const SUPA_URL = 'https://vxqajprloxxllxyqxxnp.supabase.co';
const SUPA_KEY = 'sb_publishable_m1P7ptDdHjsjlGyQaYdX-A_qdfwdrNC';

// ── Adaptadores: converte formato Supabase → formato Rubeus original ──
const adapt = {
  lead: l => ({
    'Nome da pessoa': l.nome||'',
    'Etapa': l.etapa||'',
    'Status': l.status||'',
    'Processo seletivo': l.processo||'',
    'Unidade': l.unidade||'',
    'Nome - Oferta de curso': l.oferta||'',
    'Turno': l.turno||'',
    'Data da criação': l.data_criacao||'',
    'Nome do responsável': l.responsavel||'',
    'Código de Inscrição': l.codigo_inscricao||'',
    'CodigoExterno': l.codigo_externo||'',
    '_id': l.id
  }),
  atividade: a => ({
    'Contato': a.contato||'',          // nome da pessoa
    'Atividade': a.atividade||'',
    'Status': a.status||'',            // Atrasada / Planejada / Ganho
    'Etapa': a.etapa||'',              // Entrevista Agendada / Proposta / Matrícula
    'Nome - Processo seletivo': a.processo||'',
    'Unidade': a.unidade||'',          // unidade real (PROPÓSITO LESTE etc)
    'Nome - Oferta de curso': a.oferta||'',
    'Data de vencimento': a.data_vencimento||'', // data e hora da entrevista
    'Responsável': a.responsavel||'',  // entrevistador
    'Segmento': a.segmento||'',        // segmento pretendido
    'Telefone': a.telefone||'',        // telefone do contato
    'Modalidade': a.modalidade||'presencial',
    'Link': a.link_meet||'',
    'Resultado': a.resultado||'',      // sucesso / reagendou / sem_retorno / desistiu / outro
    'ResultadoObs': a.resultado_obs||'',
    'CodigoPessoa': a.codigo_pessoa||'', // chave real para cruzar com Registros
    '_id': a.id
  }),
  proposta: p => ({
    'Aluno': p.aluno||'',
    'Série': p.serie||'',
    'Unidade': p.unidade||'',
    'Status': p.status||'',
    'COD. Inscrição': p.cod_inscricao||'',
    'Mensalidade à Vista (%)': p.mensalidade_vista||'',
    'Percentual de Desconto da Mensalidade (%)': p.desconto_mensalidade||'',
    'Matrícula à Vista (%)': p.matricula_vista||'',
    'Percentual de Desconto da Matrícula (%)': p.desconto_matricula||'',
    'Cadastrado Por': p.cadastrado_por||'',
    '_id': p.id
  })
};

// ── Converte CSV do Rubeus → formato Supabase ──
const csv2supa = {
  lead: l => ({
    nome: l['Nome da pessoa']||'',
    etapa: l['Etapa']||'',
    status: l['Status']||'',
    processo: l['Processo seletivo']||'',
    unidade: (l['Unidade']||'').replace('UNIDADE ','').replace('PROPÓSITO ','').trim(),
    oferta: l['Nome - Oferta de curso']||'',
    turno: l['Turno']||'',
    data_criacao: l['Data da criação']||'',
    responsavel: l['Nome do responsável']||'',
    codigo_inscricao: l['Código de Inscrição']||l['Código da Inscrição']||'',
    codigo_externo: l['Código externo da pessoa']||''
  }),
  atividade: a => ({
    // Mapeamento DIRETO e correto — confirmado após corrigir o parser de CSV
    // (o parser antigo desalinhava por causa do campo "Descrição" que tem ; dentro de aspas)
    contato: a['Contato']||'',                     // nome da pessoa
    atividade: a['Atividade']||'',
    status: a['Status']||'',                       // Atrasada / Planejada / Ganho
    etapa: a['Etapa']||'',                          // Entrevista Agendada / Proposta / Matrícula
    processo: a['Nome - Processo seletivo']||'',
    unidade: (a['Unidade']||'')
             .replace('UNIDADE ','').replace('PROPÓSITO ','').trim(),
    oferta: a['Nome - Oferta de curso']||'',        // segmento pretendido
    data_vencimento: a['Data de vencimento']||'',   // data e hora da entrevista
    responsavel: a['Responsável']||'',              // entrevistador
    segmento: a['Nome - Oferta de curso']||'',
    telefone: a['Telefone da pessoa']||'',          // telefone principal
    codigo_pessoa: a['Código externo da pessoa']||'' // chave real para cruzar com Registros
  }),
  proposta: p => ({
    aluno: p['Aluno']||'',
    serie: p['Série']||'',
    unidade: p['Unidade']||'',
    status: p['Status']||'',
    cod_inscricao: p['COD. Inscrição']||'',
    mensalidade_vista: p['Mensalidade à Vista (%)']||'',
    desconto_mensalidade: p['Percentual de Desconto da Mensalidade (%)']||'',
    matricula_vista: p['Matrícula à Vista (%)']||'',
    desconto_matricula: p['Percentual de Desconto da Matrícula (%)']||'',
    cadastrado_por: p['Cadastrado Por']||''
  })
};

// ── API do Supabase ──
const supa = {
  async req(method, table, body=null, params='') {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, {
        method,
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': method==='POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal'
        },
        body: body ? JSON.stringify(body) : null
      });
      if (!res.ok) { console.error('Supabase erro:', await res.text()); return null; }
      try { return await res.json(); } catch(e) { return []; }
    } catch(e) { console.error('Supabase fetch erro:', e); return null; }
  },

  async get(table, params='') { return await this.req('GET', table, null, params) || []; },
  async insert(table, data) { return await this.req('POST', table, data); },
  async upsert(table, data) { return await this.req('POST', table, Array.isArray(data)?data:[data]); },
  async update(table, data, filter) { return await this.req('PATCH', table, data, '?'+filter); },
  async del(table, filter) { return await this.req('DELETE', table, null, '?'+filter); },

  // ── LEADS ──
  async salvarLeads(leadsCSV) {
    await this.del('leads', 'id=gte.0');
    if (!leadsCSV.length) return;
    const rows = leadsCSV.map(csv2supa.lead);
    for(let i=0; i<rows.length; i+=100) await this.insert('leads', rows.slice(i,i+100));
  },
  async getLeads() {
    const rows = await this.get('leads', '?order=nome&limit=1000');
    return rows.map(adapt.lead);
  },

  // ── ATIVIDADES ──
  async salvarAtividades(atvCSV) {
    await this.del('atividades', 'id=gte.0');
    if (!atvCSV.length) return;
    const rows = atvCSV.map(csv2supa.atividade);
    for(let i=0; i<rows.length; i+=100) await this.insert('atividades', rows.slice(i,i+100));
  },
  // Mapeia código do processo para nome amigável configurado
  mapearProcesso(processo, mapa) {
    if(!mapa||!processo) return processo;
    for(const [codigo, nome] of Object.entries(mapa)) {
      if(processo.includes(codigo)||codigo.includes(processo)) return nome;
    }
    return processo;
  },

  async getAtividades() {
    const rows = await this.get('atividades', '?order=data_vencimento&limit=1000');
    return rows.map(adapt.atividade);
  },
  async atualizarAtividade(id, dados) {
    return await this.update('atividades', dados, `id=eq.${id}`);
  },

  // ── PROPOSTAS ──
  async salvarPropostas(propCSV) {
    await this.del('propostas', 'id=gte.0');
    if (!propCSV.length) return;
    const rows = propCSV.map(csv2supa.proposta);
    for(let i=0; i<rows.length; i+=100) await this.insert('propostas', rows.slice(i,i+100));
  },
  async getPropostas() {
    const rows = await this.get('propostas', '?status=eq.ATIVO&limit=1000');
    return rows.map(adapt.proposta);
  },

  // ── PLAYBOOK ──
  async salvarTarefa(selId, tarefaId, concluida) {
    return await this.upsert('playbook_tarefas', {sel_id:selId, tarefa_id:tarefaId, concluida, atualizado_em:new Date().toISOString()});
  },
  async getTarefas() { return await this.get('playbook_tarefas', '?limit=2000'); },

  // ── CDR AÇÕES ──
  async salvarAcaoCDR(leadNome, acao, obs, cdr) {
    return await this.insert('cdr_acoes', {
      lead_nome:leadNome, acao, obs, cdr,
      hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
      data:new Date().toLocaleDateString('pt-BR')
    });
  },
  async getAcoesCDR() { return await this.get('cdr_acoes', '?order=criado_em.desc&limit=5000'); },
  async salvarMassa(tipo, cdr, total) {
    return await this.insert('cdr_massa', {
      tipo, cdr, total,
      hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
      data:new Date().toLocaleDateString('pt-BR')
    });
  },

  // ── ENTREVISTAS ──
  async salvarEntrevista(ent) { return await this.upsert('entrevistas', ent); },
  async getEntrevistas() { return await this.get('entrevistas', '?order=data.desc,hora.desc&limit=500'); },
  async updateEntrevista(id, data) { return await this.update('entrevistas', data, `id=eq.${id}`); },

  // ── NEGOCIAÇÕES ──
  async salvarNegociacao(neg) { return await this.upsert('negociacoes', neg); },
  async getNegociacoes() { return await this.get('negociacoes', '?order=criado_em.desc&limit=200'); },
  async updateNegociacao(id, data) { return await this.update('negociacoes', data, `id=eq.${id}`); },

  // ── CONFIG / CALENDÁRIO ──
  async salvarConfig(chave, valor) {
    return await this.upsert('config', {chave, valor:JSON.stringify(valor), atualizado_em:new Date().toISOString()});
  },
  async getConfig(chave) {
    const rows = await this.get('config', `?chave=eq.${chave}&limit=1`);
    if(!rows||!rows.length) return null;
    try { return JSON.parse(rows[0].valor); } catch(e) { return rows[0].valor; }
  }
};

// ═══════════════════════════════════════════════
// PLAYBOOK — Resolução de tarefas com versionamento por seletivo
// Uma edição feita a partir do Nº Seletivo vale para ele e os seguintes,
// nunca para seletivos anteriores.
// ═══════════════════════════════════════════════
function resolveTarefasSeletivo(basePadrao, customList, n) {
  const baseMap = {};
  basePadrao.forEach(t => baseMap[t.id] = t);
  const porId = {};
  (customList||[]).forEach(c => {
    if(!porId[c.id]) porId[c.id] = [];
    porId[c.id].push(c);
  });
  const resultado = [];
  // Tarefas padrão — aplica a versão customizada mais recente que já estava em vigor em N
  Object.values(baseMap).forEach(base => {
    const versoes = (porId[base.id]||[])
      .filter(v => v.apartir===undefined || v.apartir<=n)
      .sort((a,b) => (b.apartir||0)-(a.apartir||0));
    if(versoes.length){
      const top = versoes[0];
      if(top.excluida) return; // removida a partir de algum seletivo <= N
      resultado.push({...base, ...top});
    } else {
      resultado.push(base);
    }
  });
  // Tarefas customizadas novas (sem base padrão) — só existem a partir do seletivo em que foram criadas
  Object.keys(porId).forEach(id => {
    if(baseMap[id]) return;
    const versoes = porId[id]
      .filter(v => v.apartir===undefined || v.apartir<=n)
      .sort((a,b) => (b.apartir||0)-(a.apartir||0));
    if(!versoes.length) return;
    const top = versoes[0];
    if(top.excluida) return;
    resultado.push(top);
  });
  return resultado;
}
window.resolveTarefasSeletivo = resolveTarefasSeletivo;
