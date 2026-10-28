// ✅ PATCHED:
//  - Fixed login() "return" bug (was double-sending response)
//  - Now returns `role` in login response
//  - Uses .select('+password') now that password is hidden by default
//  - addUser explicitly forces role: 'user'
//  - NEW: createRecruiter (admin-only)
//  - updateUser won't leak password hash in response
import userData from '../model/user.js';
import bcrypt from 'bcrypt';
import genrateToken from '../utils/jwtUtils.js';

// 1. Add User (Registration — always role: 'user')
export const addUser = async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const userDataval = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      password: password,
      role: 'user', // ✅ always user via public registration
    };
    const saveUSerData = await userData.create(userDataval);
    const cleanUser = saveUSerData.toObject();
    delete cleanUser.password; // ✅ don't leak hash

    res.status(200).json({ message: 'User added successfully', data: cleanUser });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 2. Get All Users (Admin Manage Users)
export const getUser = async (req, res) => {
  try {
    const getuserData = await userData.find(); // password hidden by default
    res.status(200).json({ message: 'Users fetched successfully', data: getuserData });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 3. Get Single User
export const getSingleUser = async (req, res) => {
  try {
    const id = req.params.uid;
    const getsingleUserdata = await userData.findById(id);
    res.status(200).json({ message: 'User fetched successfully', data: getsingleUserdata });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 4. Update User
export const updateUser = async (req, res) => {
  try {
    const id = req.params.uid;
    const updateData = { ...req.body };

    // ✅ Prevent role escalation via profile update
    delete updateData.role;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await userData.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 5. Delete User
export const deleteUSer = async (req, res) => {
  try {
    const id = req.params.uid;
    const deleteuserData = await userData.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully', data: deleteuserData });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 6. Login — ✅ FIXED the missing `return` bug + includes role now
export const login = async (req, res) => {
  try {
    const uData = await userData
      .findOne({ email: req.body.email })
      .select('+password'); // ✅ password is hidden by default now

    if (!uData) {
      return res.status(200).json({ message: 'User not found', status: 0 });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, uData.password);

    if (passwordMatch) {
      const token = genrateToken(uData);

      const cleanUser = uData.toObject();
      delete cleanUser.password; // ✅ never send hash

      return res.status(200).json({
        message: 'Login success',
        status: 1,
        data: cleanUser, // includes role
        token,
      });
    }

    return res.status(200).json({ message: 'Password not match', status: 0 });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// 7. ✅ NEW — Admin creates recruiter
export const createRecruiter = async (req, res) => {
  try {
    const { name, email, password, phone, address, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password are required' });
    }

    const existing = await userData.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const recruiter = await userData.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      company: company || '',
      companyLogo: req.body.companyLogo || '',
      role: 'recruiter', // ✅ forced
    });

    const cleanRecruiter = recruiter.toObject();
    delete cleanRecruiter.password;

    res.status(201).json({
      message: 'Recruiter created successfully',
      data: cleanRecruiter,
    });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};