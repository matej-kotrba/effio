import { json } from '@sveltejs/kit'
import prisma from '~/lib/prisma.js'
import { JOIN_CODE_EXPIRATION_VALUE } from '~schemas/inviteCode.js'

export async function GET() {
  const data = await prisma.groupInvite.deleteMany({
    where: {
      createdAt: {
        lt: new Date(new Date().getTime() - JOIN_CODE_EXPIRATION_VALUE)
      }
    }
  })

  return json({ message: 'Deleted ' + data.count + ' expired invite codes' })
}