import nodemailer from 'nodemailer'

export async function sendResetPasswordEmail(email, resetToken) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Utilise le service de ton choix (Gmail, Outlook, etc.)
        auth: {
            user: process.env.EMAIL_USER, // Ton email
            pass: process.env.EMAIL_PASSWORD, // Ton mot de passe ou ton app password
        },
    })

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`,
        html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p><a href="${resetLink}">${resetLink}</a>`,
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        throw new Error('Impossible d\'envoyer l\'email.')
    }
}