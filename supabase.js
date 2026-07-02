// Configuração do Supabase — compartilhada por todos os módulos
const SUPA_URL = 'https://vxqajprloxxllxyqxxnp.supabase.co';
const SUPA_KEY = 'sb_publishable_m1P7ptDdHjsjlGyQaYdX-A_qdfwdrNC';

const supa = {
  async req(method, table, body=null, params='') {
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
    if (!res.ok) { const err = await res.text(); console.error('Supabase erro:', err); return null; }
    try { return await res.json(); } catch(e) { return []; }
  },

  async get(table, params='') { return await this.req('GET', table, null, params); },
  async insert(table, data) { return await this.req('POST', table, data); },
  async upsert(table, data) { return await this.req('POST', table, Array.isArray(data)?data:[data]); },
  async update(table, data, filter) { return await this.req('PATCH', table, data, '?'+filter); },
  async delete(table, filter) { return await this.req('DELETE', table, null, '?'+filter); },

  // Helpers específicos
  async salvarLeads(leads) {
    // Limpa e reinserere
    await this.req('DELETE', 'leads', null, '?id=gte.0');
    if (!leads.length) return;
    const rows = leads.map(l => ({
      nome: l['Nome da pessoa']||'',
      etapa: l['Etapa']||'',
      status: l['Status']||'',
      processo: l['Processo seletivo']||'',
      unidade: (l['Unidade']||'').replace('UNIDADE ','').replace('PROPÓSITO ',''),
      oferta: l['Nome - Oferta de curso']||'',
      turno: l['Turno']||'',
      data_criacao: l['Data da criação']||'',
      responsavel: l['Nome do responsável']||'',
      codigo_inscricao: l['Código de Inscrição']||l['Código da Inscrição']||''
    }));
    // Insere em lotes de 100
    for(let i=0; i<rows.length; i+=100) {
      await this.insert('leads', rows.slice(i,i+100));
    }
  },

  async salvarAtividades(atividades) {
    await this.req('DELETE', 'atividades', null, '?id=gte.0');
    if (!atividades.length) return;
    const rows = atividades.map(a => ({
      contato: a['Contato']||'',
      atividade: a['Atividade']||'',
      status: a['Status']||'',
      etapa: a['Etapa']||'',
      processo: a['Nome - Processo seletivo']||'',
      unidade: (a['Unidade']||'').replace('UNIDADE ','').replace('PROPÓSITO ',''),
      oferta: a['Nome - Oferta de curso']||'',
      data_vencimento: a['Data de vencimento']||'',
      responsavel: a['Responsável']||''
    }));
    for(let i=0; i<rows.length; i+=100) {
      await this.insert('atividades', rows.slice(i,i+100));
    }
  },

  async salvarPropostas(propostas) {
    await this.req('DELETE', 'propostas', null, '?id=gte.0');
    if (!propostas.length) return;
    const rows = propostas.map(p => ({
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
    }));
    for(let i=0; i<rows.length; i+=100) {
      await this.insert('propostas', rows.slice(i,i+100));
    }
  },

  async getLeads() { return await this.get('leads', '?order=nome&limit=500') || []; },
  async getAtividades() { return await this.get('atividades', '?order=data_vencimento&limit=500') || []; },
  async getPropostas() { return await this.get('propostas', '?status=eq.ATIVO&limit=500') || []; },

  async salvarTarefa(selId, tarefaId, concluida) {
    return await this.upsert('playbook_tarefas', {sel_id: selId, tarefa_id: tarefaId, concluida, atualizado_em: new Date().toISOString()});
  },
  async getTarefas() { return await this.get('playbook_tarefas', '?limit=1000') || []; },

  async salvarAcaoCDR(leadNome, acao, obs, cdr) {
    return await this.insert('cdr_acoes', {lead_nome: leadNome, acao, obs, cdr, hora: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), data: new Date().toLocaleDateString('pt-BR')});
  },
  async getAcoesCDR() { return await this.get('cdr_acoes', '?order=criado_em.desc&limit=2000') || []; },

  async salvarMassa(tipo, cdr, total) {
    return await this.insert('cdr_massa', {tipo, cdr, total, hora: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), data: new Date().toLocaleDateString('pt-BR')});
  },

  async salvarEntrevista(ent) { return await this.upsert('entrevistas', ent); },
  async getEntrevistas() { return await this.get('entrevistas', '?order=data.desc,hora.desc&limit=500') || []; },
  async updateEntrevista(id, data) { return await this.update('entrevistas', data, `id=eq.${id}`); },

  async salvarNegociacao(neg) { return await this.upsert('negociacoes', neg); },
  async getNegociacoes() { return await this.get('negociacoes', '?order=criado_em.desc&limit=200') || []; },
  async updateNegociacao(id, data) { return await this.update('negociacoes', data, `id=eq.${id}`); },
};
