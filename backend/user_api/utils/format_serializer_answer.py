from rest_framework.exceptions import ValidationError


def format_serializer_answers(errors) -> dict:
    """
    Преобразует ошибку в номарльный вид без [] и лишних '' ""
    :param errors: Ошибки получаемые от rest_framework.exceptions
    :return: Словарь с ошибками в нормальном виде.
    """
    formatted_errors = {}
    if isinstance(errors, ValidationError):
        # Получаем детали ошибки
        error_detail = errors.detail

        # Преобразуем формат ошибки в удобочитаемый вид
        if isinstance(error_detail, dict):
            # Преобразуем словарь ошибок в строку
            formatted_error = {key: ' '.join(str(item) for item in value) for key, value in error_detail.items()}
        elif isinstance(error_detail, list):
            # Преобразуем список ошибок в строку
            formatted_error = {'error': ' '.join(str(item) for item in error_detail)}
        else:
            # Преобразуем ошибку в строку
            formatted_error = {'error': str(error_detail)}

        return formatted_error

    if isinstance(errors, dict):
        for field, error_list in errors.items():
            # Обработка ошибки, если она представлена в виде списка строк
            if isinstance(error_list, list):
                # Убираем лишние квадратные скобки и объединяем все ошибки в одну строку
                formatted_errors[field] = ' '.join(error_list).strip('[]').replace("'", "")
            else:
                formatted_errors[field] = str(error_list)
    else:
        # Обработка других типов ошибок, если необходимо
        formatted_errors['error'] = str(errors)

    return formatted_errors