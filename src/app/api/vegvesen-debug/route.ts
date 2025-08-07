import { NextRequest, NextResponse } from 'next/server'

// GET - Debug Vegvesen API uten autentisering for å teste
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const regNumber = searchParams.get('regNumber') || 'AB12345'
    
    // Hent API-nøkkel først
    const vegvesenApiKey = process.env.VEGVESEN_API_KEY
    
    // Test både den offisielle URL-en og andre mulige URL-er
    const officialUrl = `https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=${regNumber.toUpperCase()}`
    
    const testUrls = [
      {
        url: officialUrl,
        method: 'GET',
        headers: {
          'SVV-Authorization': `Apikey ${vegvesenApiKey || 'test-key'}`,
          'Accept': 'application/json'
        },
        description: 'Offisiell URL fra Vegvesen kodeeksempel'
      }
    ]
    
    // Andre URL-er for sammenligning
    const baseUrl = 'https://autosys-kjoretoy-api.atlas.vegvesen.no'
    const testEndpoints = [
      '/enkeltoppslag/kjoretoydata',
      '/enkeltoppslag/kjoretoy',
      '/enkeltoppslag'
    ]
    
    const results = []
    
    // Først, test den offisielle URL-en
    for (const testCase of testUrls) {
      try {
        console.log(`Testing official URL: ${testCase.url}`)
        const response = await fetch(testCase.url, {
          method: testCase.method,
          headers: testCase.headers
        })
        
        const responseText = await response.text()
        results.push({
          url: testCase.url,
          method: testCase.method,
          status: response.status,
          description: testCase.description,
          headers: Object.fromEntries(response.headers.entries()),
          response: responseText,
          requestHeaders: testCase.headers
        })
        
        // Hvis dette fungerer, returner tidlig
        if (response.ok) {
          console.log('✅ Offisiell URL fungerer!')
          return NextResponse.json({
            success: true,
            workingEndpoint: testCase.url,
            testResults: results,
            environment: {
              hasApiKey: !!vegvesenApiKey,
              regNumber,
              timestamp: new Date().toISOString()
            }
          })
        }
        
      } catch (error) {
        results.push({
          url: testCase.url,
          description: testCase.description,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    // Test forskjellige endepunkter
    for (const endpoint of testEndpoints) {
      const fullUrl = `${baseUrl}${endpoint}`
      try {
        console.log(`Testing endpoint: ${endpoint}`)
        
        // Test OPTIONS først for å se hvilke metoder som støttes
        const optionsResponse = await fetch(fullUrl, {
          method: 'OPTIONS',
          headers: {
            'X-API-Key': vegvesenApiKey || 'test'
          }
        })
        
        results.push({
          url: fullUrl,
          method: 'OPTIONS',
          status: optionsResponse.status,
          headers: Object.fromEntries(optionsResponse.headers.entries()),
          response: await optionsResponse.text()
        })
        
        // Test GET med registreringsnummer som query parameter
        const getWithQuery = await fetch(`${fullUrl}?kjennemerke=${regNumber}&registreringsnummer=${regNumber}`, {
          method: 'GET',
          headers: {
            'X-API-Key': vegvesenApiKey || 'test',
            'Accept': 'application/json'
          }
        })
        
        const getResponseText = await getWithQuery.text()
        results.push({
          url: `${fullUrl}?kjennemerke=${regNumber}`,
          method: 'GET',
          status: getWithQuery.status,
          headers: Object.fromEntries(getWithQuery.headers.entries()),
          response: getResponseText
        })
        
        // Test GET med registreringsnummer i path
        const getWithPath = await fetch(`${fullUrl}/${regNumber}`, {
          method: 'GET',
          headers: {
            'X-API-Key': vegvesenApiKey || 'test',
            'Accept': 'application/json'
          }
        })
        
        const getPathResponseText = await getWithPath.text()
        results.push({
          url: `${fullUrl}/${regNumber}`,
          method: 'GET',
          status: getWithPath.status,
          headers: Object.fromEntries(getWithPath.headers.entries()),
          response: getPathResponseText
        })
        
        // Test POST med JSON body (kun hvis ikke 404/405)
        if (getWithQuery.status !== 404 && getWithQuery.status !== 405) {
          const postResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': vegvesenApiKey || 'test',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              kjennemerke: regNumber.toUpperCase(),
              registreringsnummer: regNumber.toUpperCase()
            })
          })
          
          const postResponseText = await postResponse.text()
          results.push({
            url: fullUrl,
            method: 'POST',
            status: postResponse.status,
            headers: Object.fromEntries(postResponse.headers.entries()),
            response: postResponseText,
            requestBody: {
              kjennemerke: regNumber.toUpperCase(),
              registreringsnummer: regNumber.toUpperCase()
            }
          })
        }
        
      } catch (error) {
        results.push({
          url: fullUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      testResults: results,
      environment: {
        hasApiKey: !!vegvesenApiKey,
        regNumber,
        timestamp: new Date().toISOString()
      },
      documentation: {
        officialDocs: 'https://autosys-kjoretoy-api.atlas.vegvesen.no/api-ui/index-api.html?apiId=enkeltoppslag',
        note: 'Sjekk riktig URL og autentisering-metode i offisiell dokumentasjon'
      }
    })
    
  } catch (error) {
    console.error('Debug feil:', error)
    return NextResponse.json({
      error: 'Debug feilet',
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}