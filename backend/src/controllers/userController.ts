import { Request, Response } from 'express'
import User from '../models/User'
import { validationResult } from 'express-validator'

// Pobranie danych użytkownika
export const getUserProfile = async (
    req: Request,
    res: Response
): Promise<void> => {
    const userId = req.params.id

    try {
        const user = await User.findById(userId).select('-password')
        if (!user) {
            res.status(404).json({ message: 'User not found' })
            return
        }

        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Aktualizacja nazwy użytkownika
export const updateUsername = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { username, userId } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }

    if (!username) {
        res.status(400).json({ message: 'Username is required' })
        return
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username },
            { new: true }
        )
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' })
            return
        }

        res.status(200).json({
            message: 'Username updated successfully',
            user: updatedUser,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Aktualizacja zdjęcia profilowego
export const updateProfilePicture = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' })
        return
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`
    const userId = req.body.userId

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: profilePictureUrl },
            { new: true }
        )

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' })
            return
        }

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            url: profilePictureUrl,
            user: updatedUser,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'An error occurred while updating the picture',
        })
    }
}
