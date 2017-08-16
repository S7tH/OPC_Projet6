<?php

namespace S7tH\DirectoryBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;


class TricksEditType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->remove('image')
                ->add('image', ImageType::class, array(
                            'required' => false
                    ));
    }

    public function getParent()
    {
        return TricksType::class;
    }
}
