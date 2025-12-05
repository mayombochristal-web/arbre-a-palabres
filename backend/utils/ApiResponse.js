class ApiResponse {
    static success(res, data = {}, message = "Succès") {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    }

    static error(res, message = "Erreur inconnue", status = 500) {
        return res.status(status).json({
            success: false,
            message
        });
    }
}

module.exports = ApiResponse;
