'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Car, 
  Gauge, 
  Calendar, 
  FileText, 
  Shield, 
  Fuel, 
  Weight,
  Ruler,
  Users,
  ShoppingCart,
  Truck,
  AlertTriangle
} from 'lucide-react'

interface VehicleSpec {
  // Grunnleggende
  registrationNumber?: string | null
  make?: string | null
  model?: string | null
  variant?: string | null
  year?: number | null
  bodyType?: string | null
  color?: string | null
  mileage?: number | null
  
  // Motor og ytelse
  fuelType?: string | null
  power?: number | null
  engineSize?: number | null
  cylinderCount?: number | null
  maxSpeed?: number | null
  co2Emission?: number | null
  transmission?: string | null
  wheelDrive?: string | null
  
  // Drivstoff-forbruk
  fuelConsumptionCombined?: number | null
  fuelConsumptionCity?: number | null
  fuelConsumptionHighway?: number | null
  
  // Dimensjoner og vekter
  length?: number | null
  width?: number | null
  height?: number | null
  weight?: number | null
  maxWeight?: number | null
  payload?: number | null
  roofLoad?: number | null
  trailerWeightBraked?: number | null
  trailerWeightUnbraked?: number | null
  trunkCapacity?: number | null
  
  // Personer og komfort
  seats?: number | null
  frontSeats?: number | null
  doors?: number | null
  
  // Registrering og kontroll
  vin?: string | null
  firstRegistrationDate?: string | null
  lastInspection?: string | null
  nextInspection?: string | null
  registrationStatus?: string | null
  vehicleGroup?: string | null
  euroClass?: string | null
  
  // Sikkerhet
  abs?: boolean | null
  airbags?: boolean | null
  
  // Omregistreringsavgift
  omregistreringsavgift?: number | null
  omregAvgiftDato?: string | null
  
  // Tilstand og historikk
  accidents?: boolean | null
  serviceHistory?: string | null
  modifications?: string | null
  additionalEquipment?: string[]
  
  // Merknader
  remarks?: string[]
}

interface VehicleSpecificationsProps {
  vehicleSpec: VehicleSpec
  listingPrice: number
}

export default function VehicleSpecifications({ vehicleSpec, listingPrice }: VehicleSpecificationsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('no-NO')
  }

  const formatNumber = (num?: number, unit?: string) => {
    if (num === undefined || num === null) return null
    return `${num.toLocaleString('no-NO')}${unit ? ` ${unit}` : ''}`
  }

  // Bruk faktisk omregistreringsavgift hvis tilgjengelig, ellers estimat
  const actualRegistrationFee = vehicleSpec.omregistreringsavgift
  const registrationFee = actualRegistrationFee || Math.round(listingPrice * 0.025) // Fallback estimat 2.5% av pris
  const priceExclReg = listingPrice - registrationFee
  const totalPrice = listingPrice + registrationFee

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Spesifikasjoner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Priser og avgifter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Totalpris</div>
            <div className="font-bold text-lg text-blue-600">{formatNumber(totalPrice, 'kr')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Omregistrering</div>
            <div className="font-semibold">
              {formatNumber(registrationFee, 'kr')} 
              {actualRegistrationFee ? (
                <Badge variant="secondary" className="ml-2 text-xs">Offisiell</Badge>
              ) : (
                <Badge variant="outline" className="ml-2 text-xs">Estimat</Badge>
              )}
            </div>
            {vehicleSpec.omregAvgiftDato && (
              <div className="text-xs text-gray-500">
                Avgift per {new Date(vehicleSpec.omregAvgiftDato).toLocaleDateString('no-NO')}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-600">Annonsepr is</div>
            <div className="font-semibold">{formatNumber(listingPrice, 'kr')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Årsavgift</div>
            <div className="font-semibold text-blue-600 cursor-pointer">Les mer</div>
          </div>
        </div>

        {/* Grunnleggende informasjon */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Grunnleggende informasjon
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
            {vehicleSpec.make && (
              <div>
                <span className="text-gray-600">Merke:</span>
                <span className="ml-2 font-medium">{vehicleSpec.make}</span>
              </div>
            )}
            {vehicleSpec.model && (
              <div>
                <span className="text-gray-600">Modell:</span>
                <span className="ml-2 font-medium">{vehicleSpec.model}</span>
              </div>
            )}
            {vehicleSpec.year && (
              <div>
                <span className="text-gray-600">Modellår:</span>
                <span className="ml-2 font-medium">{vehicleSpec.year}</span>
              </div>
            )}
            {vehicleSpec.bodyType && (
              <div>
                <span className="text-gray-600">Karosseri:</span>
                <span className="ml-2 font-medium">{vehicleSpec.bodyType}</span>
              </div>
            )}
            {vehicleSpec.fuelType && (
              <div>
                <span className="text-gray-600">Drivstoff:</span>
                <span className="ml-2 font-medium">{vehicleSpec.fuelType}</span>
              </div>
            )}
            {vehicleSpec.power && (
              <div>
                <span className="text-gray-600">Effekt:</span>
                <span className="ml-2 font-medium">{vehicleSpec.power} hk</span>
              </div>
            )}
            {vehicleSpec.engineSize && (
              <div>
                <span className="text-gray-600">Slagvolum:</span>
                <span className="ml-2 font-medium">{vehicleSpec.engineSize} l</span>
              </div>
            )}
            {vehicleSpec.co2Emission && (
              <div>
                <span className="text-gray-600">CO₂-utslipp:</span>
                <span className="ml-2 font-medium">{vehicleSpec.co2Emission} g/km</span>
              </div>
            )}
            {vehicleSpec.mileage && (
              <div>
                <span className="text-gray-600">Kilometerstand:</span>
                <span className="ml-2 font-medium">{formatNumber(vehicleSpec.mileage, 'km')}</span>
              </div>
            )}
            {vehicleSpec.transmission && (
              <div>
                <span className="text-gray-600">Girkasse:</span>
                <span className="ml-2 font-medium">{vehicleSpec.transmission}</span>
              </div>
            )}
            {vehicleSpec.trailerWeightBraked && (
              <div>
                <span className="text-gray-600">Maksimal tilhengervekt:</span>
                <span className="ml-2 font-medium">{formatNumber(vehicleSpec.trailerWeightBraked, 'kg')}</span>
              </div>
            )}
            {vehicleSpec.wheelDrive && (
              <div>
                <span className="text-gray-600">Hjuldrift:</span>
                <span className="ml-2 font-medium">{vehicleSpec.wheelDrive}</span>
              </div>
            )}
            {vehicleSpec.weight && (
              <div>
                <span className="text-gray-600">Vekt:</span>
                <span className="ml-2 font-medium">{formatNumber(vehicleSpec.weight, 'kg')}</span>
              </div>
            )}
            {vehicleSpec.seats && (
              <div>
                <span className="text-gray-600">Seter:</span>
                <span className="ml-2 font-medium">{vehicleSpec.seats}</span>
              </div>
            )}
            {vehicleSpec.doors && (
              <div>
                <span className="text-gray-600">Dører:</span>
                <span className="ml-2 font-medium">{vehicleSpec.doors}</span>
              </div>
            )}
            {vehicleSpec.trunkCapacity && (
              <div>
                <span className="text-gray-600">Størrelse på bagasjerom:</span>
                <span className="ml-2 font-medium">{vehicleSpec.trunkCapacity} l</span>
              </div>
            )}
            {vehicleSpec.color && (
              <div>
                <span className="text-gray-600">Farge:</span>
                <span className="ml-2 font-medium">{vehicleSpec.color}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Drivstofforbruk */}
        {(vehicleSpec.fuelConsumptionCombined || vehicleSpec.fuelConsumptionCity || vehicleSpec.fuelConsumptionHighway) && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Drivstofforbruk
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {vehicleSpec.fuelConsumptionCombined && (
                <div>
                  <span className="text-gray-600">Blandet kjøring:</span>
                  <span className="ml-2 font-medium">{vehicleSpec.fuelConsumptionCombined} l/100km</span>
                </div>
              )}
              {vehicleSpec.fuelConsumptionCity && (
                <div>
                  <span className="text-gray-600">Bykjøring:</span>
                  <span className="ml-2 font-medium">{vehicleSpec.fuelConsumptionCity} l/100km</span>
                </div>
              )}
              {vehicleSpec.fuelConsumptionHighway && (
                <div>
                  <span className="text-gray-600">Landeveiskjøring:</span>
                  <span className="ml-2 font-medium">{vehicleSpec.fuelConsumptionHighway} l/100km</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Registrering og kontroll */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Registrering og kontroll
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div>
              <span className="text-gray-600">Bilen står i:</span>
              <span className="ml-2 font-medium">Norge</span>
            </div>
            {vehicleSpec.lastInspection && (
              <div>
                <span className="text-gray-600">Sist EU-godkjent:</span>
                <span className="ml-2 font-medium">{formatDate(vehicleSpec.lastInspection)}</span>
              </div>
            )}
            {vehicleSpec.nextInspection && (
              <div>
                <span className="text-gray-600">Neste frist for EU-kontroll:</span>
                <span className="ml-2 font-medium">{formatDate(vehicleSpec.nextInspection)}</span>
              </div>
            )}
            {vehicleSpec.vehicleGroup && (
              <div>
                <span className="text-gray-600">Avgiftsklasse:</span>
                <span className="ml-2 font-medium">{vehicleSpec.vehicleGroup}</span>
              </div>
            )}
            {vehicleSpec.registrationNumber && (
              <div>
                <span className="text-gray-600">Registreringsnummer:</span>
                <span className="ml-2 font-medium font-mono">{vehicleSpec.registrationNumber}</span>
              </div>
            )}
            {vehicleSpec.vin && (
              <div>
                <span className="text-gray-600">Chassis nr. (VIN):</span>
                <span className="ml-2 font-medium font-mono">{vehicleSpec.vin}</span>
              </div>
            )}
            {vehicleSpec.firstRegistrationDate && (
              <div>
                <span className="text-gray-600">1. gang registrert:</span>
                <span className="ml-2 font-medium">{formatDate(vehicleSpec.firstRegistrationDate)}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Salgsform:</span>
              <span className="ml-2 font-medium">Bruktbil til salgs</span>
            </div>
          </div>
        </div>

        {/* Tilleggsutstyr */}
        {vehicleSpec.additionalEquipment && vehicleSpec.additionalEquipment.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Tilleggsutstyr
              </h4>
              <div className="flex flex-wrap gap-2">
                {vehicleSpec.additionalEquipment.map((equipment, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {equipment}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Merknader fra Vegvesen */}
        {vehicleSpec.remarks && vehicleSpec.remarks.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Merknader fra Vegvesen
              </h4>
              <div className="space-y-2">
                {vehicleSpec.remarks.map((remark, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                    {remark}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
