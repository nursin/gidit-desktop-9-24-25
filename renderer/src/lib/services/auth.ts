// Placeholder authentication helpers
export async function signIn(email: string, _password: string) {
  console.warn('signIn placeholder', email)
  return { user: { email } }
}

export async function signOut() {
  console.warn('signOut placeholder')
}
