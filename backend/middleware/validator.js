/**
 * Input validation helpers matching Java DTO annotations
 */

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  // Java constraint: @Size(min = 10, max = 72)
  if (password.length < 10 || password.length > 72) {
    return res.status(400).json({
      success: false,
      message: 'Password must be between 10 and 72 characters in length.'
    });
  }

  // Java constraint: @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$")
  const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!passwordComplexityRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must include at least one uppercase letter, one lowercase letter, and one number.'
    });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  next();
}

export function validateVehicle(req, res, next) {
  const { name, make, model, year, mileage } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Vehicle name is required.' });
  }

  if (!make || !make.trim()) {
    return res.status(400).json({ success: false, message: 'Vehicle make is required.' });
  }

  if (!model || !model.trim()) {
    return res.status(400).json({ success: false, message: 'Vehicle model is required.' });
  }

  if (year && (isNaN(year) || year < 1900 || year > 2100)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 4-digit model year.' });
  }

  if (mileage !== undefined && (isNaN(mileage) || mileage < 0)) {
    return res.status(400).json({ success: false, message: 'Mileage must be a positive number.' });
  }

  next();
}

export function validateSensorUpload(req, res, next) {
  const { vehicleId } = req.body;

  if (!vehicleId) {
    return res.status(400).json({ success: false, message: 'Vehicle ID is required.' });
  }

  next();
}

export function validateMaintenance(req, res, next) {
  const { vehicleId, action } = req.body;

  if (!vehicleId) {
    return res.status(400).json({ success: false, message: 'Vehicle ID is required.' });
  }

  if (!action || !action.trim()) {
    return res.status(400).json({ success: false, message: 'Maintenance action description is required.' });
  }

  next();
}
