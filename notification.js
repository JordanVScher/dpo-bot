/* eslint no-param-reassign: 0 */ // --> OFF
import 'dotenv/config';

import { CronJob } from 'cron';
import { fs } from 'fs';
import { jsonfile } from 'jsonfile';
import sendBroadcast from './src/utils/broadcast';
import { moment } from './src/utils/helper';

const sessionsFolder = './.sessions/';

const msgs = [
	{
		text: 'Fique ligado!\nO General Data Protection Regulation (Regulamento Geral de Proteção de Dados - GDPR) é a norma da União Europeia sobre proteção de dados. O regulamento foi sancionado em 2016 e passou a valer em 2018, mudando a forma com que as empresas e demais instituições do mundo inteiro lidam com o dados pessoais.\nA principal intenção do GDPR é criar uma cultura de dados cidadã e consciente, que garanta a proteção da segurança e da privacidade dos titulares e evite que as corporações/organizações utilizem essas informações de maneira antiética e assegura mais equilibrio nas relações em que há o tratamento de dados pessoais.',
		buttons: [
			{ content_type: 'text', title: 'Voltar', payload: 'mainMenu' },
		],
	},
	{
		text: 'Sabia que você pode transferir seus dados para outra pessoa ou empresa mediante requisição expressa? Caso queira enviá-los, clique no botão Solicitações > Portabilidade de Dados ;)',
		buttons: [
			{ content_type: 'text', title: 'Voltar', payload: 'mainMenu' },
			{ content_type: 'text', title: 'Solicitações', payload: 'solicitacoes' },
		],
	},
	{
		text: 'A LGPD foi sancionada em agosto de 2018, mas a sua vigência só inicia em agosto de 2020.\nIsso significa que a partir de agosto de 2020 todas as empresas e entes públicos deverão estar em conformidade com todos requisitos da lei, assim como devem estar prontas para atender todas as solicitações dos consumidores 👋😄',
		buttons: [
			{ content_type: 'text', title: 'Voltar', payload: 'mainMenu' },
		],
	},
	{
		text: `Realizamos a coleta de dados pessoais mediante a sua autorização ou de seus responsáveis. :) A coleta é realizada quando você utiliza os nossos serviços, por meio de formulários, cookies ou quando é efetuada a transferência para nós.
Em determinados casos será necessário a autorização dos responsáveis de modo expresso.
Caso você queira mais informações, clique em Solicitações > Fale conosco.`,
		buttons: [
			{ content_type: 'text', title: 'Voltar', payload: 'mainMenu' },
			{ content_type: 'text', title: 'Solicitações', payload: 'solicitacoes' },
		],
	},
];

async function sendNotificacao(file, fileName, text, buttons) {
	const error = await sendBroadcast(file.user.id, text, { quick_replies: buttons });
	if (!error) {
		console.log(`Broadcast enviado para ${file.user.id} - ${file.user.name}`);
		file._state.notificacao.sent += 1;
		file._state.notificacao.date = new Date();
		jsonfile.writeFile(sessionsFolder + fileName, file)
			.then(() => console.log(`Novo estado de ${file.user.id} escrito com sucesso!`))
			.catch((err) => console.log(`Não foi possível salvar o estado de ${file.user.id} - ${file.user.name} depois do broadcast`, err));
	} else {
		console.log(`Erro ao enviar o broadcast para ${file.user.id}:`, error);
	}
}

async function checkTimeDifference(date) {
	const dateM = moment(date);

	const now = moment(new Date());
	const diff = now.diff(dateM, 'minutes');

	if (diff >= 5) return true;
	return false;
}

async function checkNotificacao() {
	const listNames = fs.readdirSync(sessionsFolder); // get all file names
	for (let i = 0; i < listNames.length; i++) {
		const fileName = listNames[i]; // get current filename
		const file = jsonfile.readFileSync(sessionsFolder + fileName); // load file as a json
		if (file._state.wantNotification) {
			if (!file._state.notificacao) { file._state.notificacao = { sent: 0, date: null }; }
			const opt = msgs[file._state.notificacao.sent];
			if (opt) {
				const checkTime = await checkTimeDifference(file._state.notificacao.date);

				if (!file._state.notificacao.date || checkTime) {
					await sendNotificacao(file, fileName, opt.text, opt.buttons);
				}
			}
		}
	}
}


const notificacaoCron = new CronJob(
	'00 0-59/5 * * * *', async () => {
		console.log('Running notificacao');
		try {
			await checkNotificacao();
		} catch (error) {
			console.log('notificacao error', error);
		}
	}, (() => { console.log('Crontab notificacao stopped.'); }),
	false, 'America/Sao_Paulo', false, false,
);

// if (process.env.REACT_APP_ENV !== 'PROD') notificacaoCron.start();

export default notificacaoCron;
