const User = require('./auth.dao');
// Google Calendar deshabilitado (2026-03-20)
// const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = process.env.SECRET_KEY;
const axios = require('axios');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
// Gmail deshabilitado (2026-03-20)
// const transporter = require('../mailer');
const { uploadFileToS3, deleteFileFromS3 } = require('../s3');
const multer = require('multer');
const upload = multer();

async function getGoogleCalendar(user) {
    // Google Calendar deshabilitado (2026-03-20)
    console.log('[Calendar deshabilitado] Intento de acceso al calendario');
    return null;
}

exports.listEvents = async (req, res) => {
    // Google Calendar deshabilitado (2026-03-20)
    res.json({ message: 'Google Calendar deshabilitado - servicio solo local' });
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Middleware de autenticación
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

exports.ensureAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Programador' && req.user.role === 'Gerente') {
        return next();
    } else {
        return res.status(403).json({ success: false, message: 'Access denied: Admins only.' });
    }
};

exports.datosCiudades = async (req, res, next) => {
    try {
        const response = await axios.get('https://api-colombia.com/api/v1/City');
        const departamentosExcluidos = [];
        const datosFiltrados = response.data.filter(ciudad => !departamentosExcluidos.includes(ciudad.departamento));
        res.json(datosFiltrados);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.datosDepartamentos = async (req, res, next) => {
    try {
        const response = await axios.get('https://api-colombia.com/api/v1/Department');
        const departamentosExcluidos = [];
        const datosFiltrados = response.data.filter(ciudad => !departamentosExcluidos.includes(ciudad.departamento));
        res.json(datosFiltrados);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUserWithProfileImage = async (req, res) => {
    const { email, nombre, telefono, password, cargo } = req.body;
    const roles = req.body.roles;

    if (!email || !nombre || !telefono || !password || !cargo || !roles) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userObject = {
            email,
            nombre,
            telefono,
            password: hashedPassword,
            cargo,
            role: roles  // Asegúrate de asignar los roles correctamente
        };

        if (req.file) {
            const uploadResult = await uploadFileToS3(req.file);
            userObject.image = uploadResult.Location; // Almacenar solo la URL
        }

        const newUser = new User(userObject);
        const user = await newUser.save();

        res.json({
            success: true,
            message: 'User created successfully with profile image (if provided)!',
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                telefono: user.telefono,
                cargo: user.cargo,
                role: user.role,
                image: user.image || null,
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { email, nombre, telefono, password, cargo, role } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (password && password !== user.password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            user.password = hashedPassword;
        }

        user.email = email;
        user.nombre = nombre;
        user.telefono = telefono;
        user.cargo = cargo;
        user.role = role.split(',');

        if (req.file) {
            if (user.image) {
                const key = user.image.split('/').pop();
                await deleteFileFromS3(key);
            }

            const uploadResult = await uploadFileToS3(req.file);
            user.image = uploadResult.Location; // Almacenar solo la URL
        }

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.loginUserName = async (req, res, next) => {
    const userData = {
        email: req.body.email,
        password: req.body.password
    };

    try {
        const user = await User.findOne({ email: userData.email }).exec();
        if (!user) {
            res.status(409).json({
                success: false,
                message: 'Something is wrong'
            });
        } else {
            const resultPassword = bcrypt.compareSync(userData.password, user.password);
            if (resultPassword) {
                const expiresIn = 60 * 60 * 24;
                const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: expiresIn });

                res.json({
                    success: true,
                    message: 'Logged in successfully!',
                    accessToken: accessToken,
                    expiresIn: expiresIn
                });
            } else {
                res.status(409).json({
                    success: false,
                    message: 'Something is wrong'
                });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/*
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(409).json({
                success: false,
                message: 'User not found'
            });
        } else {
            const resultPassword = bcrypt.compareSync(password, user.password);
            if (resultPassword) {
                if (!user.googleAuthenticatorSecret && !user.verificationCode) {
                    return res.json({
                        success: true,
                        requiresTwoFactorSetup: true,
                        userId: user._id
                    });
                }

                const expiresIn = '10s';
                const accessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn });

                return res.json({
                    success: true,
                    requiresTwoFactorAuth: true,
                    userId: user._id,
                    accessToken: accessToken,
                    expiresIn: expiresIn,
                    methods: {
                        email: !!user.verificationCode,
                        googleAuthenticator: !!user.googleAuthenticatorSecret
                    }
                });
            } else {
                return res.status(409).json({
                    success: false,
                    message: 'Password incorrect'
                });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
*/

exports.verifyTwoFactorAuth = async (req, res) => {
    const { userId, token } = req.body;

    if (!userId || !token) {
        return res.status(400).json({ message: 'userId and token are required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.googleAuthenticatorSecret,
            encoding: 'base32',
            token: token,
            window: 1
        });

        if (verified) {
            const expiresIn = '7d';
            const accessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: expiresIn });

            res.json({
                success: true,
                accessToken: accessToken,
                expiresIn: expiresIn
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error during 2FA verification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.enableTwoFactorAuth = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const secret = speakeasy.generateSecret({
            name: `ACS (${user.email})`,
            issuer: 'ACS'
        });
        user.googleAuthenticatorSecret = secret.base32;
        await user.save();

        const otpauthUrl = secret.otpauth_url;

        qrcode.toDataURL(otpauthUrl, (err, data_url) => {
            if (err) {
                console.error('Error generating QR code:', err);
                return res.status(500).json({ message: 'Error generating QR code' });
            }

            res.json({
                message: 'Two-factor authentication enabled',
                qrCodeUrl: data_url,
                success: true,
                userId: user._id
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie('user');
    res.status(200).json({ success: true, message: 'Logged out successfully!' });
};

exports.verifyAdminRole = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verificamos si el usuario tiene uno de los roles permitidos para acceso administrativo
        const adminRoles = ['Programador', 'Gerente'];
        const hasAdminAccess = user.role.some(role => adminRoles.includes(role));

        if (!hasAdminAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admins only.'
            });
        }

        // Si pasa la verificación, continuamos con el siguiente middleware o ruta
        next();
    } catch (error) {
        console.error('Error verifying admin role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.image && user.image.path) {
            fs.unlinkSync(user.image.path);
        }

        const result = await User.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.sendVerificationCode = async (req, res) => {
    // Gmail deshabilitado (2026-03-20) - codigo se genera pero no se envia por email
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Guardar codigo en BD (se puede verificar manualmente)
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log(`[Email deshabilitado] Codigo de verificacion para ${email}: ${verificationCode}`);

        res.json({
            success: true,
            message: 'Servicio de correo deshabilitado - use autenticador de Google',
        });
    } catch (error) {
        console.error('Error en verificacion: ', error);
        res.status(500).json({ success: false, message: 'Error en el proceso de verificacion' });
    }
};

exports.verifyVerificationCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.verificationCode !== verificationCode || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }

        // Código verificado, restablecer los campos
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        // Generar token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });

        res.json({
            success: true,
            message: 'Verification successful',
            accessToken: token
        });
    } catch (error) {
        console.error('Error verifying the code:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};