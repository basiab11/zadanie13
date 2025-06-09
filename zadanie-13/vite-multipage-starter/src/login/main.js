console.log('nested');
const SUPABASE_URL = "https://uegxvwvhocbfdwfijslb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ3h2d3Zob2NiZmR3Zmlqc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDkzNjYsImV4cCI6MjA2NDc4NTM2Nn0.Z6TJ0gsMGJMFM1V4Gs6sKolzksfCBftiQaaPMUPmvcI";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    alert('Błąd logowania: ' + error.message)
    return
  }

  alert('Zalogowano pomyślnie!')
  
  window.location.href = '/'
})
