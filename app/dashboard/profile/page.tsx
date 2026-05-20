import { Topbar }      from '@/components/dashboard/topbar'
import { ProfileForm }  from '@/components/dashboard/profile-form'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function ProfilePage() {
  return (
    <>
      <Topbar title="Mi perfil" />
      <div className="flex-1 px-12 py-8 max-md:px-6">
        <ProfileForm />
      </div>
      <ScrollReveal />
    </>
  )
}
