import {FastifyReply, FastifyRequest} from 'fastify';
import {Paste} from '../documents/Pastes';
import {verify} from 'argon2';
import {viewPasteParams} from '../interfaces/PastesInterfaces';

export async function pasteHandler(
  request: FastifyRequest<{
    Params: viewPasteParams;
  }>,
  reply: FastifyReply
) {
  let {id} = request.params;

  const password = id.split('-')[1];
  id = id.split('-')[0];

  const RequestedPaste = await Paste.findOne({
    $or: [{_id: id}, {deletionKey: id}],
  });

  if (
    !RequestedPaste ||
    RequestedPaste.disabled ||
    (RequestedPaste.expiresAt !== -1 &&
      new Date(RequestedPaste.expiresAt).getTime() < Date.now())
  )
    return reply.status(400).send({message: 'Unknown Paste.'});

  if (RequestedPaste.password && !password)
    return reply
      .status(401)
      .send({message: 'Provide the password for the paste.'});

  if (
    RequestedPaste.password &&
    !(await verify(RequestedPaste.password, password))
  ) {
    return reply.status(401).send({message: 'Incorrect Password.'});
  }

  request.params.paste = RequestedPaste;
  return;
}
