from django.core.signing import Signer, BadSignature
from users.models.users import EmailConfirmationToken

"""
 Здесь создаются токены при помощи криптографической подписи
 Возможно есть способ лучше, но я пока не нашёл
"""


def generate_signed_token(user):
    signer = Signer()
    signed_id_and_email = signer.sign_object(f'{user.id}%{user.email}')
    return f"{signed_id_and_email}"

def create_confirmation_token(user):
    token = generate_signed_token(user)
    email_token = EmailConfirmationToken.objects.create(user=user, token=token)
    return email_token.token


def verify_signed_token(token):
    signer = Signer()
    email = None
    user_id = None


    try:
        # Распакуйте подписанный объект
        signed_id_and_email = signer.unsign_object(token)
        user_id, email = signed_id_and_email.split('%')

        return email, user_id
    except (BadSignature, ValueError) as e:
        return email, user_id