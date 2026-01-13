const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID;

async function listAllFields() {
  try {
    const fieldsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    const fields = await fieldsResponse.json();
    
    console.log('📋 Todos os Custom Fields do Board:');
    console.log('='.repeat(60));
    
    fields.forEach((field, index) => {
      console.log(`\n${index + 1}. Nome: "${field.name}"`);
      console.log(`   ID: ${field.id}`);
      console.log(`   Tipo: ${field.type}`);
      
      if (field.options && field.options.length > 0) {
        console.log(`   Opções:`);
        field.options.forEach((opt, i) => {
          console.log(`     ${i + 1}. ${opt.value.text}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

listAllFields();
