import { Topbar }      from '@/components/dashboard/topbar'
import { ProfileForm }  from '@/components/dashboard/profile-form'

export default function ProfilePage() {
  return (
    <>
      <Topbar title="Mi perfil" />
      <div className="flex-1">
        <ProfileForm />
      </div>
    </>
  )
}
