import { NewsItem } from '../types';

export const ALL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Grande Batizado e Troca de Cordas Elite Nagô 2026',
    category: 'Evento Oficial',
    date: '29 | 30 Agosto, 2026',
    summary: 'Encontro internacional reunindo mestres, contramestres e alunos de diversos estados para a celebração da cultura e graduação.',
    content: `O Grupo Elite Nagô tem a honra de convidar toda a comunidade da Capoeira para o nosso tradicional Grande Batizado e Troca de Cordas 2026.

Este ano, o evento celebra a expansão e o fortalecimento de nossas raízes, contando com uma programação intensiva de dois dias:
• Oficinas práticas de movimentação avançada e floreios
• Aprofundamento nos fundamentos históricos da Capoeira Nagô
• Vivência de Maculelê e Samba de Roda tradicional
• Grande Roda de Mestres convidados com representantes da Bahia, Rio de Janeiro, São Paulo e Minas Gerais
• Cerimônia solene de graduação e entrega de novas cordas

Local: Ginásio Poliesportivo Municipal / Centro de Treinamento Elite Nagô
Acomodação solidária e credenciamento de caravanas disponíveis mediante contato prévio.`,
    featured: true,
    tag: 'DESTAQUE',
  },
  {
    id: 'news-2',
    title: 'Oficina de Berimbau e Cantigas de Roda',
    category: 'Cultura & Música',
    date: '15 Novembro, 2026',
    summary: 'Workshop prático de afinação de Berimbau, ritmos de Angola, São Bento Grande e composição de ladainhas.',
    content: `A musicalidade é a alma e o coração pulsante da Capoeira. Esta oficina imersiva ministrada por mestres e contramestres abordará os segredos da orquestra de berimbaus (Gunga, Médio e Viola).

Conteúdo programático:
1. Escolha da verga, cuidados com a cabaça e amarração correta do arame
2. Técnicas de afinação por ressonância harmônica
3. Variações rítmicas dos toques: São Bento Pequeno, Benguela, Cavalaria, Santa Maria e Iúna
4. A arte da improvisação em ladainhas, chulas e corridos

Incluso: Apostila digital com letras históricas e certificado de participação. Aberto a todos os níveis.`,
    featured: false,
    tag: 'WORKSHOP',
  },
  {
    id: 'news-3',
    title: 'Projeto Capoeira Mirim: Formando Cidadãos no Esporte',
    category: 'Social & Infantil',
    date: '02 Dezembro, 2026',
    summary: 'Iniciativa social leva treinos, disciplina e musicalidade para crianças de 5 a 12 anos em comunidades locais.',
    content: `Com o firme propósito de transformar vidas através da arte-educação, o Projeto Capoeira Mirim abre 50 novas vagas 100% gratuitas para crianças e jovens da rede pública de ensino.

O projeto une desenvolvimento motor, disciplina, respeito à ancestralidade e convívio comunitário saudável. Além dos treinos técnicos de capoeira, os jovens participam de:
• Aulas lúdicas de percussão e cantigas populares
• Acompanhamento pedagógico e incentivo à leitura
• Distribuição de uniforme e cordas oficiais do projeto

Inscrições abertas na secretaria da academia e nas unidades parceiras participantes.`,
    featured: false,
    tag: 'PROJETO SOCIAL',
  },
  {
    id: 'news-4',
    title: ' Jogos Internos Elite Nagô',
    category: 'Competição & Jogos',
    date: '18 Janeiro, 2027',
    summary: 'Torneio técnico que valoriza a ginga, a malícia, a técnica refinada e o jogo limpo em duplas e solos.',
    content: `Vem aí a 4ª Edição da Copa Regional Elite Nagô! Um encontro que premia não apenas a plasticidade acrobática, mas sobretudo os fundamentos da Capoeira: volume de jogo, resposta no tempo da cantiga, esquivas precisas e camaradagem na roda.

Categorias em disputa:
• Juvenil (13 a 17 anos) - Masculino e Feminino
• Graduados e Instrutores - Jogos de Benguela e São Bento Grande
• Master (acima de 40 anos) - Jogo de Mandinga e Tradição

Premiação em troféus artesanais talhados em madeira e medalhas exclusivas. Venha torcer e prestigiar a nata da Capoeira!`,
    featured: false,
    tag: 'COMPETIÇÃO',
  },
  {
    id: 'news-5',
    title: 'Encontro Estadual de Mulheres na Capoeira',
    category: 'Cultura & Música',
    date: '08 Março, 2027',
    summary: 'Espaço de protagonismo feminino, rodas cantadas, palestras sobre liderança e oficinas de movimentação.',
    content: `Um evento histórico para celebrar e fortalecer a presença feminina na Capoeira Nagô. O encontro contará com rodas exclusivas comandadas por professoras e contramestras, mesas de debate sobre a trajetória das mulheres na capoeira e oficina de toques tradicionais.`,
    featured: false,
    tag: 'DESTAQUE',
  },
  {
    id: 'news-6',
    title: 'Vivência de Maculelê e Ancestralidade Africana',
    category: 'Cultura & Música',
    date: '25 Março, 2027',
    summary: 'Encontro cultural de dança guerreira de bastões, percussão de atabaques e cânticos tradicionais.',
    content: `O Maculelê é a pura manifestação da energia, do ritmo e da história afro-indígena. Convidamos todos os capoeiristas e simpatizantes para uma tarde de imersão total com bastões de madeira de lei, toques de agogô e dança tradicional.`,
    featured: false,
    tag: 'CULTURA',
  },
  {
    id: 'news-7',
    title: 'Seminário de Condicionamento Físico e Prevenção de Lesões',
    category: 'Saúde & Preparação',
    date: '14 Abril, 2027',
    summary: 'Metodologia biomecânica aplicada ao treino de capoeira com fisioterapeutas e preparadores esportivos.',
    content: `Voltado para instrutores, professores e praticantes assíduos, este seminário aborda mobilidade articular de quadril e ombros, fortalecimento de core e estratégias preventivas para prolongar a longevidade física na roda.`,
    featured: false,
    tag: 'SAÚDE & TREINO',
  },
  {
    id: 'news-8',
    title: 'Festival de Cantigas e Ladainhas Tradicionais',
    category: 'Cultura & Música',
    date: '02 Maio, 2027',
    summary: 'Concurso e celebração da oralidade poética da capoeira com premiação para novas composições autorais.',
    content: `A oralidade é a guardiã da memória de nossos ancestrais. O festival reunirá poetas e cantadores da capoeira para apresentações de ladainhas, chulas e quadras inéditas, além de homenagens aos velhos mestres.`,
    featured: false,
    tag: 'MÚSICA',
  },
];
