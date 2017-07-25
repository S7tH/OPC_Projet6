<?php

namespace S7tH\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class S7tHUserBundle extends Bundle
{
    public function getParent()
    {
        return 'FOSUserBundle';
    }
}
