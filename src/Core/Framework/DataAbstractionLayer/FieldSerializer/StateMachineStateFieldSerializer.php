<?php
// Copyright (c) Pickware GmbH. All rights reserved.
// This file is part of software that is released under a proprietary license.
// You must not copy, modify, distribute, make publicly available, or execute
// its contents or parts thereof without express permission by the copyright
// holder, unless otherwise permitted by law.

declare(strict_types=1);

namespace Shopware\Core\Framework\DataAbstractionLayer\FieldSerializer;

use Shopware\Core\Framework\DataAbstractionLayer\Exception\InvalidSerializerFieldException;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StateMachineStateField;
use Shopware\Core\Framework\DataAbstractionLayer\Write\DataStack\KeyValuePair;
use Shopware\Core\Framework\DataAbstractionLayer\Write\EntityExistence;
use Shopware\Core\Framework\DataAbstractionLayer\Write\WriteParameterBag;
use Shopware\Core\Framework\Validation\WriteConstraintViolationException;
use Symfony\Component\Validator\ConstraintViolationList;

class StateMachineStateFieldSerializer extends FkFieldSerializer
{
    public function encode(
        Field $field,
        EntityExistence $existence,
        KeyValuePair $data,
        WriteParameterBag $parameters
    ): \Generator {
        if (!($field instanceof StateMachineStateField)) {
            throw new InvalidSerializerFieldException(StateMachineStateField::class, $field);
        }

        // Always allow any status when creating a new entity. A state transition from one state into another makes no
        // sense in that case.
        if (!$existence->exists()) {
            return parent::encode($field, $existence, $data, $parameters);
        }

        // Allow the change of the
        if (in_array($parameters->getContext()->getContext()->getScope(), $field->getAllowedWriteScopes(), true)) {
            return parent::encode($field, $existence, $data, $parameters);
        }

        throw new WriteConstraintViolationException(new ConstraintViolationList([]), $parameters->getPath());
    }
}
