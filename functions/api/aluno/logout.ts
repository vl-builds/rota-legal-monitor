import { clearCookie } from '../../_shared/cookies'
import { noContent } from '../../_shared/responses'

export const onRequestPost: PagesFunction = async () => {
  return noContent([clearCookie('aluno_session')])
}
