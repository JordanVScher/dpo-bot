module.exports = {
	avatarImage: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/c3687467-aa57-43c4-b369-0a09824808f6.jpg',
	getStarted: 'Olá, sou o DIPIOU',
	share: {
		title: 'DIPIOU_BOT',
		subtitle: 'Dippy',
		image_url: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/c3687467-aa57-43c4-b369-0a09824808f6.jpg',
		item_url: 'www.google.com',
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
		menuOptions: ['Meus Dados', 'Revogar meus Dados'],
		menuPostback: ['meusDados', 'revogarDados'],
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
		text3: '1) Receber novidades pelos canais de comunicação\n2) Ganhar descontos exclusivos\n3) [demais itens]',
		text4: 'Seus dados são bem-cuidados, mas você tem todo direito de revogá-lo. Você gostaria de continuar a revogação?',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['revogacaoSim', 'revogacaoNao'],
	},
	revogacaoNao: {
		text1: 'ok',
	},
	sobreLGPD: {
		text1: 'LGPD é isso e aquilo',
	},
	sobreDipiou: {
		text1: 'Dipiou é isso e aquilo',
	},
	revogacaoSim: {
		text1: 'Sem problemas 👍',
		text2: 'Você precisa ser o titular dos dados que deseja revogar, tudo bem? De acordo com a lei [xpto]\n[texto sobre responsabilidade]',
		text3: 'Você é o titular dos dados?',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['titularSim', 'titularNao'],
	},
	titularSim: {
		text1: 'Vou te fazer umas perguntas.',
		askTitularName: 'Insira seu nome completo:',
		askTitularCPF: 'Agora, insira seu CPF (apenas números, sem pontos ou vírgular ou traços)',
		askTitularPhone: 'Insira seu telefone com DDD para que a gente possa entrar em contato sobre o seu pedido. Guardaremos esse dado apenas para a equipe entrar em contato com você sobre seu pedido!',
		askTitularMail: 'E, por fim, insira um e-mail válido que você mais utiliza. Usararemos apenas para garantir que consigamos falar contigo. Tudo bem?',
	},
	titularDadosFim: {
		text1: 'Guardando seus dados e gerando seu ticket',
		gif: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/a651b037-1f1c-408c-b107-a11f5e63f1a9.gif',
		text2: '[texto sobre processo de autenticação a definir]',
		ticketOpened: 'Seu ticket foi aberto e será respondido em até 72h. Enquanto isso, você pode escolher uma das opções abaixo e compartilhar o Dipi aqui para mais pessoas saberem de mim 🤓',
	},
	issueText: {
		success: 'Obrigado por sua mensagem',
		failure: 'Não consegui salvar a mensagem',
	},
	titularNao: {
		text1: 'Então não pode revogar né',
	},
};
