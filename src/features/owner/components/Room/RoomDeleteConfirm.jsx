import React from 'react'
import toast from 'react-hot-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteRoomMutation } from '../../store/roomApi';
const RoomDeleteConfirm = ({roomId,  open, onOpenChange}) => {
    const [deleteRoom, {isLoading}] = useDeleteRoomMutation()
    const handleDelete = async ()=>{
        try {
            await deleteRoom(roomId).unwrap()
            toast.success('Delete room successfully')
            onOpenChange(false)

        } catch (error) {
            console.error(error);
            toast.error('Delete room failed')
            
        }
    }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete room</AlertDialogTitle>
                <AlertDialogDescription>Confirm delete room</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default RoomDeleteConfirm