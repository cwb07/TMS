<nav class="navbar navbar-expand-lg" style="background-color: #99cdf4; margin-bottom: 10px">
	<div class="container-fluid">
		<span class="navbar-brand" id="userId" style="flex-grow: 1; text-align: left;">
			<b>Welcome, USERID</b>
		</span>

		<a class="navbar-brand mx-auto" href="/user_management"><u><b>USER MANAGEMENT SYSTEM</b></u></a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav ms-auto">
				<li class="nav-item">
					<a
						class="nav-link border border-dark rounded px-2 py-1"
						href="/profile"
						style="margin-right: 10px;">Edit Profile</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-dark rounded px-2 py-1" href="/user_management">Logout</a
					>
				</li>
			</ul>
		</div>
	</div>
</nav>

<div class="container">
	<div class="row justify-content-center align-items-center" style="margin-top: 250px">
		<div class="col-md-6 col-lg-4">
			<div class="card">
				<div class="card-body">
					<h3 class="card-title text-center mb-4">Update Info</h3>
					<form method="POST">
						<div class="mb-3">
							<label for="email" class="form-label">Current Email Address</label>
							<p id="email"><b>user@example.com</b></p>
						</div>
						<div class="mb-3">
							<label for="email" class="form-label">New Email</label>
							<input id="email" name="email" class="form-control" />
						</div>
						<div class="mb-3">
							<label for="password" class="form-label">New Password</label>
							<input id="password" type="password" name="password" class="form-control" />
						</div>
						<button type="submit" class="btn btn-primary w-100">Update</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
