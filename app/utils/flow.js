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
		text1: 'Você pode me fazer uma pergunta a qualquer momento ou escolher uma das opções abaixo:',
	},
	atendimentoLGPD: {
		text1: 'Combinado 😉\nVocê pode me fazer uma pergunta livremente como "Como proteger meus dados" ou escolher uma das opções abaixo:',
		waitQuestion: 'Legal! Me conta, o que você gostaria de saber?',
		options: {
			1: {
				content_type: 'text',
				title: 'Revogar meus Dados',
				payload: 'revogarDados',
			},
			2: {
				content_type: 'text',
				title: 'Meus Dados',
				payload: 'meusDados',
			},
		},
	},
	meusDados: {
		meusDadosCPF: 'Ok, primeiro preciso que você me forneça seu cpf para que seja possível consultar seus dados.',
		meusDadosTitular: 'Ok, agora preciso que você confirme que você é o titular dos dados referentes a esse cpf. Você é o titular?',
		dadosTitularSim: 'Salvamos o seu pedido de visualização de dados. Estaremos te retornando em breve.',
		dadosTitularNao: 'Para segurança e privacidade, apenas o titular dos dados pode fazer essa requisição.',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['dadosTitularSim', 'dadosTitularNao'],
	},
	revogarDados: {
		text1: 'Quando o assunto é dado pessoal, meu conselho é sempre ir com cautela. É muito importante você saber os dados que temos e para que servem 😉',
		text2: 'Mas antes de revogar seus dados, saiba que de modo geral usamos os dados dos clientes para usufruirem dos seguintes benefícios:',
		text3: '1) Receber novidades pelos canais de comunicação\n2) Ganhar descontos exclusivos',
		text4: 'Seus dados são bem cuidados, mas você tem todo direito de revogá-lo. Você gostaria de continuar a revogação?',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['revogacaoSim', 'revogacaoNao'],
	},
	revogacaoNao: {
		text1: 'Tudo bem, se mudar de ideia, estamos aqui.',
	},
	sobreLGPD: {
		text1: `A Lei Geral de Proteção de Dados Pessoais (LGPD ou LGPDP), Lei nº 13.709/2018, é a legislação brasileira que regula as atividades de tratamento de dados pessoais e que também altera os artigos 7º e 16 do Marco Civil da Internet.

A legislação se fundamenta em diversos valores, como o respeito à privacidade; à autodeterminação informativa; à liberdade de expressão, de informação, de comunicação e de opinião; à inviolabilidade da intimidade, da honra e da imagem; ao desenvolvimento econômico e tecnológico e a inovação; à livre iniciativa, livre concorrência e defesa do consumidor e aos direitos humanos liberdade e dignidade das pessoas. `,
	},
	sobreDipiou: {
		text1: 'Sou um chatbot, um robô conversacional, para harmozinar sua comunição com as empresas, sempre pensando em valorizar a sua privacidade.',
	},
	revogacaoSim: {
		text1: 'Sem problemas 👍',
		text2: 'Você precisa ser o titular dos dados que deseja revogar, tudo bem?',
		text3: 'Você é o titular dos dados?',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['titularSim', 'titularNao'],
	},
	titularSim: {
		text1: 'Vou te fazer umas perguntas.',
		askTitularName: 'Insira seu nome completo:',
		askTitularNameFail: 'Nome inválido! Tente novamente',
		askTitularCPF: 'Agora, insira seu CPF.',
		askTitularCPFFail: 'CPF inválido! Exemplo de CPF: 123.123.123-00',
		askTitularPhone: 'Insira seu telefone com DDD para que a gente possa entrar em contato sobre o seu pedido. Guardaremos esse dado apenas para a equipe entrar em contato com você sobre seu pedido!',
		askTitularPhoneFail: 'Fone inválido! Exemplo: 55555-4444 ou (55)115555-4444',
		askTitularMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
		askTitularMailFail: 'E-mail inválido! Tente Novamente',
	},
	titularDadosFim: {
		text1: 'Guardando seus dados e gerando seu ticket',
		gif: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/a651b037-1f1c-408c-b107-a11f5e63f1a9.gif',
		text2: '[texto sobre processo de autenticação a definir]',
		ticketOpened: 'Seu ticket foi aberto e será respondido em até 72h. Enquanto isso, você pode escolher uma das opções abaixo e compartilhar o Dipi aqui para mais pessoas saberem de mim 🤓',
	},
	issueText: {
		success: 'Você me pegou. Preciso pensar e te retorno em breve.',
		failure: 'Não consegui salvar a mensagem',
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
		cancelFailure: 'Houce um erro na hora de salvar sua mensagem. Tente novamente.',
		menuOptions: ['Voltar'],
		menuPostback: ['meuTicket'],
	},
};
