"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function VegvesenTestPage() {
  const [regNumber, setRegNumber] = useState('NF12345')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/vegvesen-debug?regNumber=${regNumber}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Feil ved testing:', error)
      setResults({ error: 'Test feilet' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500'
    if (status >= 400 && status < 500) return 'bg-yellow-500'
    if (status >= 500) return 'bg-red-500'
    return 'bg-gray-500'
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Vegvesen API Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Vegvesen API Endepunkter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Registreringsnummer:
              </label>
              <Input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="Norsk reg.nr (f.eks. NF12345)"
              />
            </div>
            <Button 
              onClick={testApi} 
              disabled={loading}
              className="px-6"
            >
              {loading ? 'Testing...' : 'Test API'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>API Key:</strong> {results.environment?.hasApiKey ? '✅ Satt' : '❌ Mangler'}
                </div>
                <div>
                  <strong>Reg.nr:</strong> {results.environment?.regNumber}
                </div>
                <div>
                  <strong>Tid:</strong> {results.environment?.timestamp}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Test Resultater</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.testResults?.map((result: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`${getStatusColor(result.status)} text-white`}
                        >
                          {result.method} {result.status}
                        </Badge>
                        <span className="text-sm font-mono">
                          {result.url}
                        </span>
                      </div>
                    </div>
                    
                    {result.error && (
                      <div className="text-red-600 text-sm mt-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.response && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            Se respons
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {typeof result.response === 'string' 
                              ? result.response 
                              : JSON.stringify(result.response, null, 2)
                            }
                          </pre>
                        </details>
                      </div>
                    )}
                    
                    {result.requestBody && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-green-600 hover:text-green-800">
                            Se request body
                          </summary>
                          <pre className="mt-2 p-2 bg-green-50 rounded text-xs">
                            {JSON.stringify(result.requestBody, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {results.documentation && (
            <Card>
              <CardHeader>
                <CardTitle>Dokumentasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Offisiell dokumentasjon:</strong>{' '}
                    <a 
                      href={results.documentation.officialDocs} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {results.documentation.officialDocs}
                    </a>
                  </div>
                  <div>
                    <strong>Note:</strong> {results.documentation.note}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}