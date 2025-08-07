import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
              K
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Logg inn på Kulbruk.no
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Eller{' '}
            <a href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
              opprett en ny konto
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden"
              }
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  )
}