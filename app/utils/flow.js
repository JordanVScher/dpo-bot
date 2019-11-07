module.exports = {
	avatarImage: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/c3687467-aa57-43c4-b369-0a09824808f6.jpg',
	getStarted: 'Olá, sou o DIPIOU',
	share: {
		txt1: 'Encaminhe nosso bot!',
		cardData: {
			title: 'DIPIOU_BOT',
			subtitle: 'Dippy',
			image_url: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/c3687467-aa57-43c4-b369-0a09824808f6.jpg',
			item_url: 'https://www.facebook.com',
		},
	},
	greetings: {
		text1: 'Olá, <USERNAME>! Que bom te ver por aqui! Eu sou o Dipiou, mas pode me chamar de Dipi.',
		text2: 'Sou o assistente digital e estou aqui para te ajudar sobre a Lei Geral de Proteção de Dados (LGPD) 🤓',
	},
	mainMenu: {
		text1: ['Ajudo em algo mais?', 'Como posso te ajudar?', 'Em que posso ser útil?'],
		firstTime: 'Você pode me fazer uma pergunta a qualquer momento ou escolher uma das opções abaixo:',
		gerando: 'Gerando seu ticket...',
		createTicket: 'Foi aberto um chamado para sua solicitação e você pode consultá-la em "Meus Tickets".\nO Número de protocolo do seu chamado é: <TICKET>.',
	},
	solicitacoes: {
		builtInSairResponse: ['cancelado', 'cancelada', 'cancelar', 'cancelei', 'cancelados', 'canceladas'],
		text1: 'Combinado 😉\nVocê pode me fazer uma pergunta livremente como "Como proteger meus dados" ou escolher uma das opções abaixo:',
		waitQuestion: 'Legal! Me conta, o que você gostaria de saber?',
		userHasOpenTicket: 'Você já tem uma solicitação de <TIPO_TICKET> em andamento. Você pode visualizar seus chamados na opção Meus Tickets.',
		noSolicitationType: 'Ops, não entendi que tipo de solicitação você deseja. Por favor me informe algo como "Consultar dados" ou "Alterar dados", por exemplo.',
		// add the new type of ticket to the array below to properly include it on the menu
		activeSolicitations: [1, 2, 3, 5, 6, 7, 8],
		// fixed menu, for testing only
		menuOptions: ['Revogar meus Dados', 'Meus Dados', 'Alterar meus Dados', 'Fale conosco', 'Fale com DPO', 'Incidente'],
		menuPostback: ['solicitacao1', 'solicitacao2', 'solicitacao3', 'solicitacao5', 'solicitacao6', 'solicitacao7'],
		// dictionary: [dialogflow entity]: tycket_type id
		typeDic: {
			Revogar: 1, Consultar: 2, Alterar: 3, Incidente: 7, Portabilidade: 8, // ADD TEXT TO typeDic on confirmaSolicitacao
		},
	},
	confirmaSolicitacao: {
		text1: 'Você tem certeza que deseja <TIPO>?',
		typeDic: {
			1: 'solicitar uma revogação',
			2: 'solicitar uma consulta',
			3: 'solicitar uma alteração',
			7: 'reportar um incidente',
			8: 'abrir uma solicitação de portabilidade',
		},
		default: 'abrir uma nova solicitação',
		menuOptions: ['Sim', 'Não'],
		menuPostback: [null, 'mainMenu'],
	},
	solicitacaoVoltar: {
		menuOptions: ['Voltar'],
		menuPostback: ['mainMenu'],
	},
	files: {
		wait: 'Aguarde um instante, estou processando os seus arquivos.',
	},
	consumidor: {
		text1: 'Escolha uma opção ou me faça uma pergunta.',
	},
	dataFail: {
		cpf: 'CPF inválido! Exemplo de CPF: 123.123.123-00',
		name: 'Nome inválido! Tente novamente',
		phone: 'Fone inválido! Exemplo: 55555-4444 ou (55)115555-4444',
		mail: 'E-mail inválido! Tente Novamente',
	},
	revogar: {
		text1: 'Quando o assunto é dado pessoal, meu conselho é sempre ir com cautela. É muito importante você saber os dados que temos e para que servem 😉',
		text2: 'Lembre-se, cuidamos dos seus dados com muito carinho. Caso você queira consultar seus dados antes de revogar o seu consentimento é só fazer uma solicitação de Consulta de dados.',
		text3: 'Gostaria de continuar com a revogação?',
		CPFNext: 'askRevogarName',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['askRevogarCPF', 'revogacaoNao'],
		revogacaoNao: 'Sem problemas 👍',
		askRevogarCPF: 'Primeiro, preciso que você entre com seu CPF.',
		askRevogarName: 'Insira seu nome completo:',
		askRevogarPhone: 'Insira seu telefone com DDD para que a gente possa entrar em contato sobre o seu pedido. Guardaremos esse dado apenas para a equipe entrar em contato com você sobre seu pedido!',
		askRevogarMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
	},
	askCPF: {
		clickTheButton: ' Ou clique no botão abaixo para cancelar o pedido.',
		menuOptions: ['Cancelar'],
		menuPostback: ['mainMenu'],
	},
	CPFConfirm: {
		ask: 'Eu declaro ser o proprietário dos dados referentes ao CPF <CPF>.',
		revogacaoNao: 'Para segurança e privacidade, apenas o titular dos dados pode fazer essa requisição.',
		menuOptions: ['Aceitar', 'Recusar'],
		menuPostback: ['askRevogarCPF', 'titularNao'],
	},
	consultar: {
		consultarCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para consultar seus dados.',
		CPFNext: 'consultarEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	alterar: {
		alterarCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para alterar ou apagar seus dados.',
		CPFNext: 'alterarEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	incidente: {
		intro: 'Você pode reportar o incidente de forma anônima ou se indentificar. Como prefere?',
		menuOptions: ['Identificado', 'Anônimo'],
		menuPostback: ['incidenteI', 'incidenteA'],
		askFile: 'Como preferir, agora, suba o arquivo nessa conversa e me envie.',
		incidenteCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para reportar o incidente.',
		time: 1000 * 20,
		CPFNext: 'incidenteEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	atendimentoAvançado: {
		intro: 'Você pode entrar em contato como Mídia ou como ANPD. Como prefere?',
		menuOptions: ['Mídia', 'ANPD'],
		menuPostback: ['solicitacao9', 'solicitacao10'],
		atendimentoCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para o DPO entrar em contato.',
		CPFNext: 'avançadoMEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	avançadoMidia: {
		atendimentoCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para o DPO entrar em contato.',
		CPFNext: 'avançadoMEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	avançadoANDP: {
		atendimentoCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para o DPO entrar em contato.',
		CPFNext: 'avançadoAEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	faleConosco: {
		faleConoscoCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para o DPO entrar em contato.',
		CPFNext: 'faleConoscoEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	atendimento: {
		intro: 'Essa é uma solicitação apenas para autoridade e avisando que se for midia ou titular, deve ir para o Fale conosco. Tudo bem?',
		menuOptions: ['Continuar', 'Voltar'],
		menuPostback: ['atendimentoAskCPF', 'mainMenu'],
		atendimentoCPF: 'Ok, primeiro preciso que você me forneça seu CPF para que seja possível abrir um chamado para o DPO entrar em contato.',
		CPFNext: 'atendimentoEmail',
		askMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askMailFail: 'E-mail inválido! Tente Novamente',
	},
	sobreLGPD: {
		text1: `A Lei Geral de Proteção de Dados Pessoais (LGPD ou LGPDP), Lei nº 13.709/2018, é a legislação brasileira que regula as atividades de tratamento de dados pessoais e que também altera os artigos 7º e 16 do Marco Civil da Internet.

A legislação se fundamenta em diversos valores, como o respeito à privacidade; à autodeterminação informativa; à liberdade de expressão, de informação, de comunicação e de opinião; à inviolabilidade da intimidade, da honra e da imagem; ao desenvolvimento econômico e tecnológico e a inovação; à livre iniciativa, livre concorrência e defesa do consumidor e aos direitos humanos liberdade e dignidade das pessoas. `,
		videoLink: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/files/d3f121c6-ac3e-4881-a484-9fa33c272bd0/y2mate.com_patricia_peck_fala_sobre_protecao_dos_dados_pessoais_duLAb_PQuMw_360p.mp4',
	},
	sobreDipiou: {
		text1: 'Sou um chatbot, um robô interativo, estou aqui para harmonizar a sua comunição com as empresas, sempre pensando em valorizar a sua privacidade.',
	},
	issueText: {
		success: ['Você me pegou. Preciso pensar e te retorno em breve.',
			'Não te entendi mas pesquisarei e logo te trarei a resposta.',
			'Não captei a mensagem mas logo um humano vai te responder.',
		],
		failure: 'Não te entendi, tente novamente.',
	},
	titularNao: {
		text1: 'Nesse caso, não será possível continuar com a operação.',
	},
	quiz: {
		beginQuiz: 'Vamos lá!',
		form_error: 'Ops, Ocorreu um erro interno, tente novamente!',
		invalid: 'Esse formato é inválido! Tente Novamente',
		// done: 'Você terminou o Questionário Preparatório! Parabéns!',
	},
	ticketStatus: {
		pending: { name: 'Aberto', position: 1 },
		progress: { name: 'Em Andamento', position: 2 },
		closed: { name: 'Fechado', position: 3 },
		canceled: { name: 'Cancelado', position: 4 },
	},
	cancelConfirmation: {
		confirm: 'Tem certeza que quer cancelar o ticket de <TYPE>?',
		cancelSuccess: 'Cancelamos seu ticket com sucesso',
		cancelFailure: 'Houve um erro na hora de cancelar seu ticket. Tente novamente.',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['confirmaCancelamento', 'meuTicket'],
	},
	leaveTMsg: {
		text1: 'Digite sua mensagem!',
		cancelSuccess: 'Conseguimos salvar sua mensagem.',
		cancelFailure: 'Houve um erro na hora de salvar sua mensagem. Tente novamente.',
		menuOptions: ['Voltar'],
		menuPostback: ['meuTicket'],
	},
	informacoes: {
		text1: 'Você pode escolher um dos assuntos abaixo ou me fazer uma pergunta ;)',
		text2: 'Digite sua mensagem que vamos te responder o quanto antes.',
		textWait: 'Tudo bem, qualquer dúvida é só mandar.',
		time: 1000 * 20,
	},
	notifications: {
		on: 'Legal! Estarei te interando das novidades! Se quiser parar de receber nossas novidades, clique na opção "Parar Notificações 🛑" no menu abaixo. ⬇️',
		off: 'Você quem manda. Não estarei mais te enviando nenhuma notificação. Se quiser voltar a receber nossas novidades, clique na opção "Ligar Notificações 👌" no menu abaixo. ⬇️',
	},
};
