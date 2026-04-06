const Users = require('./auth.controller');
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated, authorizeRoles } = require('../auth.middleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = (router) => {
    router.post('/adminLogin/login', Users.loginUserName);
    router.post('/adminLogin/logout', Users.logoutUser);

    router.post('/app-admin/register', upload.single('imagen'), Users.createUserWithProfileImage);

    router.put('/updateuser/:id', ensureAuthenticated, authorizeRoles('Programador', 'Gerente'), upload.single('imagen'), [
        body('email').isEmail().withMessage('Invalid email format'),
        body('nombre').not().isEmpty().withMessage('Name is required'),
        body('telefono').not().isEmpty().withMessage('Phone is required')
    ], validateRequest, Users.updateUser);

    router.get('/users', Users.getAllUsers);
    router.get('/ciudades', Users.datosCiudades);
    router.get('/departamentos', Users.datosDepartamentos);
    router.get('/user/:id', Users.getUserById);
    router.get('/getuser/:id', Users.authenticateToken, Users.verifyAdminRole, Users.getUserById);
    router.delete('/deleteuser', ensureAuthenticated, authorizeRoles('Programador', 'Gerente'), Users.deleteUser);
};

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}