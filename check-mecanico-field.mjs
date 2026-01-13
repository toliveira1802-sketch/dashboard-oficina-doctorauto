const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID;

async function checkMecanicoField() {
  try {
    // Buscar custom fields do board
    const fieldsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    const fields = await fieldsResponse.json();
    
    // Encontrar campo Mecânico
    const mecanicoField = fields.find(f => f.name === 'Mecânico');
    
    if (!mecanicoField) {
      console.log('❌ Campo "Mecânico" não encontrado!');
      return;
    }
    
    console.log('✅ Campo "Mecânico" encontrado!');
    console.log('\n📋 Opções disponíveis:');
    console.log('='.repeat(50));
    
    if (mecanicoField.options) {
      mecanicoField.options.forEach((option, index) => {
        console.log(`${index + 1}. ${option.value.text} (ID: ${option.id})`);
      });
    } else {
      console.log('Nenhuma opção encontrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkMecanicoField();
