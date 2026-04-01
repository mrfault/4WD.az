<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'max:20'],
            'customer_name' => ['nullable', 'string', 'max:100'],
            'message' => ['nullable', 'string', 'max:1000'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'source' => ['required', 'string', 'in:product,contact,general'],
            'page_url' => ['nullable', 'url', 'max:500'],
            'locale' => ['nullable', 'string', 'in:az,en'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Phone number is required.',
            'phone.max' => 'Phone number must not exceed 20 characters.',
            'source.required' => 'Lead source is required.',
            'source.in' => 'Lead source must be one of: product, contact, general.',
            'product_id.exists' => 'The selected product does not exist.',
            'locale.in' => 'Locale must be az or en.',
            'page_url.url' => 'Page URL must be a valid URL.',
        ];
    }
}
