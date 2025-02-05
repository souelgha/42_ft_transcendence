export class LoginPage {
    async handle() {
        const loginHTML = `
<section class="gradient-custom">
  <div class="container py-5 h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-12 col-md-8 col-lg-6 col-xl-5">
        <div class="card bg-dark text-white" style="border-radius: 1rem;">
          <div class="card-body p-5 text-center">

            <div class="mb-md-5 mt-md-4 pb-5">

              <h2 class="fw-bold mb-2 text-uppercase">Login</h2>
              <p class="text-white-50 mb-5">Please enter your login and password!</p>

              <div data-mdb-input-init class="form-outline form-white mb-4">
                <input type="email" id="typeEmailX" class="form-control form-control-lg" placeholder="Email" />
                <div id="emailError" class="text-danger small mt-1" style="display: none;">Please enter your email</div>
              </div>

              <div data-mdb-input-init class="form-outline form-white mb-4">
                <input type="password" id="typePasswordX" class="form-control form-control-lg" placeholder="Password" />
                <div id="passwordError" class="text-danger small mt-1" style="display: none;">Please enter your password</div>
              </div>

              <p class="small mb-5 pb-lg-2"><a class="text-white-50" href="#!">Forgot password?</a></p>

              <button data-mdb-button-init data-mdb-ripple-init class="btn btn-outline-light btn-lg px-5" type="submit" id="loginButton">Login</button>

              <div class="d-flex justify-content-center text-center mt-4 pt-1">
                <a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
                <a href="#!" class="text-white"><i class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
                <a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
              </div>

            </div>

            <div>
              <p class="mb-0">Don't have an account? <a href="/register" data-path="/register" class="text-white-50 fw-bold">Sign Up</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</section>
        `;

        document.getElementById('dynamicPage').innerHTML = loginHTML;

        // Add event listener for form validation
        document.getElementById('loginButton').addEventListener('click', (e) => this.sendToBackend(e));
    }

    validateForm(e) {
        const email		= document.getElementById('typeEmailX');
        const password	= document.getElementById('typePasswordX');
        const emailError	= document.getElementById('emailError');
        const passwordError	= document.getElementById('passwordError');

        let isValid		= true;

        // Reset error messages
        emailError.style.display = 'none';
        passwordError.style.display = 'none';

        // Validate email
        if (!email.value.trim()) {
            emailError.style.display = 'block';
            isValid = false;
        }

        // Validate password
        if (!password.value.trim()) {
            passwordError.style.display = 'block';
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    }

    async sendToBackend(e) {
      if (this.validateForm(e) == false) {
          return false;
      }

      try {
          // sending a post request to the backend -> (email, username, password)
          //Who will allow us to login
          /*---------------------------REQUEST-----------------------------*/
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': window.csrfToken,
              },
              credentials: 'same-origin',
              body: JSON.stringify({ 'email': document.getElementById('typeEmailX').value,
                  'password': document.getElementById('typePasswordX').value
               })
          });
          /*--------------------------ENDREQUEST----------------------------*/
          console.log("use token:", window.csrfToken);
          console.log('Response status:', response.status);
          console.log('Response headers:', Object.fromEntries(response.headers));

          //if we get a bad response 
          if (!response.ok) {
              const errorText = await response.text();
              console.error('Response error:', errorText);
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Success:', data);
          //changing the page to ProfilePage 
          window.router.navigateTo('/profile');

      } catch (error) {
          console.error('Error details:', error);
          passwordError.textContent = 'User email or password is incorrect';
          passwordError.style.display = 'block';
          throw error;
      }
}
}
