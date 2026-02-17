const ptBR = {
  translation: {
    // ─── Common ──────────────────────────────────────────────────────────
    common: {
      appName: 'YASTM',
      appFullName: 'Gerenciador de Tarefas Simples',
      save: 'Salvar',
      cancel: 'Cancelar',
      create: 'Criar',
      update: 'Atualizar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      close: 'Fechar',
      none: 'Nenhum',
      noneF: 'Nenhuma',
      unknown: 'Desconhecido',
      actions: 'Ações',
      name: 'Nome',
      title: 'Título',
      description: 'Descrição',
      email: 'E-mail',
      password: 'Senha',
      created: 'Criado em',
      updated: 'Atualizado em',
      saveFailed: 'Falha ao salvar',
      deleteFailed: 'Falha ao excluir',
      loading: 'Carregando...',
    },

    // ─── Navigation / Layout ────────────────────────────────────────────
    nav: {
      dashboard: 'Painel',
      tasks: 'Tarefas',
      teams: 'Equipes',
      users: 'Usuários',
      statuses: 'Status',
      labels: 'Etiquetas',
      logout: 'Sair',
    },

    // ─── Auth ───────────────────────────────────────────────────────────
    auth: {
      signIn: 'Entrar',
      signingIn: 'Entrando…',
      signInSubtitle: 'Acesse sua conta',
      signUp: 'Cadastrar',
      creatingAccount: 'Criando conta…',
      createAccount: 'Crie uma nova conta',
      noAccount: 'Não possui uma conta?',
      hasAccount: 'Já possui uma conta?',
      loginFailed: 'Falha ao realizar login',
      registerFailed: 'Falha ao realizar cadastro',
    },

    // ─── Dashboard ──────────────────────────────────────────────────────
    dashboard: {
      title: 'Painel',
      tasks: 'Tarefas',
      users: 'Usuários',
      teams: 'Equipes',
      statuses: 'Status',
      labels: 'Etiquetas',
    },

    // ─── Tasks ──────────────────────────────────────────────────────────
    tasks: {
      title: 'Tarefas',
      newTask: 'Nova Tarefa',
      loadFailed: 'Falha ao carregar tarefas',
      emptyState: 'Nenhuma tarefa ainda. Crie uma para começar!',
      status: 'Status',
      priority: 'Prioridade',
      subtasks: 'Subtarefas',
      subtasksCount_one: '{{count}} subtarefa (todos os níveis)',
      subtasksCount_other: '{{count}} subtarefas (todos os níveis)',
    },

    // ─── Task Detail Modal ──────────────────────────────────────────────
    taskDetail: {
      editTask: 'Editar tarefa',
      cloneTask: 'Clonar tarefa',
      saveChanges: 'Salvar alterações',
      cancelEditing: 'Cancelar edição',
      viewing: 'Visualizando',
      editing: 'Editando',
      description: 'Descrição',
      noDescription: 'Sem descrição',
      priority: 'Prioridade',
      currentStatus: 'Status Atual',
      change: 'Alterar',
      noStatus: 'Sem status',
      possibleStatuses: 'Status Possíveis',
      selectStatuses: 'Selecione os status…',
      assignees: 'Responsáveis',
      selectAssignees: 'Selecione os responsáveis…',
      labels: 'Etiquetas',
      parentTask: 'Tarefa Pai',
      selectParentTask: 'Selecione a tarefa pai…',
      noParent: 'Nenhuma (tarefa raiz)',
      assignor: 'Atribuído por',
      predictedFinishDate: 'Previsão de Conclusão',
      subtasks: 'Subtarefas',
      subtaskTitle: 'Título da subtarefa',
      noSubtasks: 'Nenhuma subtarefa ainda.',
      comments: 'Comentários',
      noComments: 'Nenhum comentário ainda. Inicie a conversa!',
      writeComment: 'Escreva um comentário…',
      // Clone dialog
      cloneDialogTitle: 'Clonar Tarefa',
      cloneDialogMessage: 'Deseja tornar a tarefa clonada uma subtarefa da tarefa atual?',
      cloneAsSubtask: 'Sim, como subtarefa',
      cloneIndependent: 'Não, cópia independente',
      // Delete dialog
      deleteTask: 'Excluir tarefa',
      deleteDialogTitle: 'Excluir Tarefa',
      deleteDialogMessage: 'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
      // Errors
      loadFailed: 'Falha ao carregar tarefa',
      createSubtaskFailed: 'Falha ao criar subtarefa',
      addCommentFailed: 'Falha ao adicionar comentário',
      changeStatusFailed: 'Falha ao alterar status',
      saveChangesFailed: 'Falha ao salvar alterações',
      cloneFailed: 'Falha ao clonar tarefa',
      deleteFailed: 'Falha ao excluir tarefa',
    },

    // ─── Teams ──────────────────────────────────────────────────────────
    teams: {
      title: 'Equipes',
      newTeam: 'Nova Equipe',
      editTeam: 'Editar Equipe',
      loadFailed: 'Falha ao carregar equipes',
      emptyState: 'Nenhuma equipe ainda.',
      deleteConfirm: 'Excluir esta equipe?',
    },

    // ─── Users ──────────────────────────────────────────────────────────
    users: {
      title: 'Usuários',
      loadFailed: 'Falha ao carregar usuários',
      emptyState: 'Nenhum usuário encontrado.',
      joined: 'Cadastrado em',
      deleteConfirm: 'Excluir este usuário?',
    },

    // ─── Statuses ───────────────────────────────────────────────────────
    statuses: {
      title: 'Status',
      newStatus: 'Novo Status',
      editStatus: 'Editar Status',
      loadFailed: 'Falha ao carregar status',
      emptyState: 'Nenhum status ainda.',
      deleteConfirm: 'Excluir este status?',
    },

    // ─── Labels ─────────────────────────────────────────────────────────
    labels: {
      title: 'Etiquetas',
      newLabel: 'Nova Etiqueta',
      editLabel: 'Editar Etiqueta',
      loadFailed: 'Falha ao carregar etiquetas',
      emptyState: 'Nenhuma etiqueta ainda.',
      deleteConfirm: 'Excluir esta etiqueta?',
    },

    // ─── Report ───────────────────────────────────────────────────────
    report: {
      title: 'Relatório',
      loadFailed: 'Falha ao carregar relatório',
      statusDistribution: 'Distribuição por Status',
      overallCompletion: 'Progresso Geral',
      tasksWithStatus: 'Tarefas com status definido',
      tasks: 'Tarefas',
      noStatus: 'Sem status',
      noData: 'Sem dados para exibir.',
      noTaskId: 'Nenhuma tarefa informada para o relatório.',
      colTitle: 'Título',
      colDescription: 'Descrição',
      colStatus: 'Status Atual',
      colAssignee: 'Responsável',
      colPredictedConclusion: 'Previsão de Conclusão',
      exportPdf: 'Exportar PDF',
      exportXlsx: 'Exportar XLSX',
      openPublicReport: 'Abrir relatório público',
    },

    // ─── Activity Log ─────────────────────────────────────────────────
    activityLog: {
      title: 'Histórico de Atividades',
      back: 'Voltar',
      date: 'Data',
      user: 'Usuário',
      action: 'Ação',
      field: 'Campo',
      oldValue: 'Valor Anterior',
      newValue: 'Novo Valor',
      noLogs: 'Nenhuma atividade registrada.',
      includeSubtasks: 'Incluir subtarefas',
      task: 'Tarefa',
      rowsPerPage: 'Linhas por página',
      startDate: 'Data Início',
      endDate: 'Data Fim',
      actions: {
        TASK_CREATED: 'Tarefa criada',
        TASK_UPDATED: 'Tarefa atualizada',
        TASK_DELETED: 'Tarefa excluída',
        ASSIGNEE_ADDED: 'Responsável adicionado',
        ASSIGNEE_REMOVED: 'Responsável removido',
        STATUS_ADDED: 'Status adicionado',
        STATUS_REMOVED: 'Status removido',
        CURRENT_STATUS_CHANGED: 'Status atual alterado',
        LABEL_ADDED: 'Etiqueta adicionada',
        LABEL_REMOVED: 'Etiqueta removida',
        TASK_CLONED: 'Tarefa clonada',
        COMMENT_ADDED: 'Comentário adicionado',
      },
      fields: {
        title: 'Título',
        description: 'Descrição',
        parent_task_id: 'Tarefa Pai',
        priority: 'Prioridade',
        predicted_finish_date: 'Previsão de Conclusão',
        current_status_id: 'Status Atual',
        assignee_ids: 'Responsáveis',
        possible_status_ids: 'Status Possíveis',
        label_ids: 'Etiquetas',
      },
    },

    // ─── Priority values ────────────────────────────────────────────────
    priority: {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    },
  },
};

export default ptBR;

