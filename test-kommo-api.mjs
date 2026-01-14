const KOMMO_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijc2OGVkZjgzNzJkMDZlMjE1NmI2NjhjNzYwOGUwODVkMWNlZTMxYjkzNDExN2EzMjA0MjM3YzkyMjE4ZDc1NjllNTliZTQxNzRmMGY0MzVjIn0.eyJhdWQiOiI2Y2MxOTNiNi0wNDY2LTQ1OGEtOWUyMS05OWFkN2FiNDliNGQiLCJqdGkiOiI3NjhlZGY4MzcyZDA2ZTIxNTZiNjY4Yzc2MDhlMDg1ZDFjZWUzMWI5MzQxMTdhMzIwNDIzN2M5MjIxOGQ3NTY5ZTU5YmU0MTc0ZjBmNDM1YyIsImlhdCI6MTc2ODM2MDg4MCwibmJmIjoxNzY4MzYwODgwLCJleHAiOjE4OTMzNjk2MDAsInN1YiI6Ijg1NjE3MTEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzM1MDQyNDMsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiIyMGM2MjUyYS04NDI4LTQ4OGQtOWRiMi1iYTIzNzM3NmEwMzYiLCJ1c2VyX2ZsYWdzIjowLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.LtZz9ZgPGuDX8SWWYjd0Z9fuNwxOKMdku6rYFnhWPzZqK5k9Kjvb6RInF5GXp3lP1bo9LdxJx19n5Tg-Uerk2tFvAaOTw2RkKYr5-gFv5vCS9_6vJjicGCbEREw9MqSIwC8aVx5EBauDOZShTAgrQGToKxDBy5z5qGB35Ji53AEW1CrKI_9HInmMGXQD0gZm0hC2RwpBladTcS7ABrwLovC_V1FN0IabeUZyOVNrL6ULDlNWztRUzPkjgoupsnk_bKoVcLSJFmfBdtSa91Ng72tERk6fAAE9D8-MSX8Qy1-laDaRyJzTfD71gOvE9dI-CoHQrQ1mOF-K2GfNLPoqZg';
const KOMMO_DOMAIN = 'https://doctorautobosch.kommo.com';
const PIPELINE_ID = 12704980;

async function fetchKommoPipelines() {
  try {
    console.log('🔍 Buscando pipelines do Kommo...\n');
    
    const response = await fetch(`${KOMMO_DOMAIN}/api/v4/leads/pipelines`, {
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    
    console.log('📊 Resposta completa:\n');
    console.log(JSON.stringify(data, null, 2));
    
    // Buscar status específicos do pipeline 12704980
    if (data._embedded && data._embedded.pipelines) {
      const targetPipeline = data._embedded.pipelines.find(p => p.id === PIPELINE_ID);
      
      if (targetPipeline) {
        console.log('\n\n✅ Pipeline ID 12704980 encontrado:');
        console.log('Nome:', targetPipeline.name);
        console.log('\n📋 Status disponíveis:\n');
        
        if (targetPipeline._embedded && targetPipeline._embedded.statuses) {
          targetPipeline._embedded.statuses.forEach(status => {
            console.log(`- ID: ${status.id} | Nome: "${status.name}" | Cor: ${status.color}`);
          });
        }
      } else {
        console.log('\n⚠️ Pipeline 12704980 não encontrado na lista');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar pipelines:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

fetchKommoPipelines();
