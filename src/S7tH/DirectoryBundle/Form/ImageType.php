<?php

namespace S7tH\DirectoryBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class ImageType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            //->add('url', TextType::class)
            //->add('alt', TextType::class)
            ->add('file', FileType::class, array('label' => ' '));
            // label is empty because a 2nd label was displaying by default (this) and broke the design.
           
    }
    
    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'intention' => 'task_form',
            'data_class' => 'S7tH\DirectoryBundle\Entity\Image'
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 's7th_directorybundle_image';
    }


}
